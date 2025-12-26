/**
 * TikTok Live Quiz - Robust Server
 * Features: SQLite Persistence, Auto-Reconnect, REST API + WebSocket
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { WebcastPushConnection } from 'tiktok-live-connector';
import cors from 'cors';
import {
    getState, setState,
    updatePintarScore, updateSultanScore,
    getPintarScores, getSultanScores,
    resetScores
} from './db.js';

const PORT = 3001;
const RECONNECT_DELAY_BASE = 2000;
const RECONNECT_DELAY_MAX = 30000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- Global State ---
// Load initial state from DB or default
let appState = getState('appState') || {
    activeQuestion: null,
    isActive: false,
    timerEndTime: null,
    connectedUser: null
};

// --- REST API for Persistence ---

app.get('/api/state', (req, res) => {
    res.json({
        ...appState,
        pintarScores: getPintarScores(),
        sultanScores: getSultanScores(),
        serverTime: Date.now()
    });
});

app.post('/api/reset', (req, res) => {
    resetScores();
    appState.activeQuestion = null;
    appState.isActive = false;
    appState.timerEndTime = null;
    setState('appState', appState);

    broadcast({ type: 'reset' });
    res.json({ success: true });
});

// --- WebSocket Server ---

function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('📱 Client connected');

    // Send immediate sync on connection
    ws.send(JSON.stringify({
        type: 'sync',
        state: appState,
        pintarScores: getPintarScores(),
        sultanScores: getSultanScores(),
        tiktokStatus: tiktokStatus()
    }));

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());

            switch (data.type) {
                case 'connect':
                    startTikTokConnection(data.username);
                    break;

                case 'disconnect':
                    stopTikTokConnection();
                    break;

                case 'updateState':
                    // Update server state from Control Panel
                    appState = { ...appState, ...data.state };
                    setState('appState', appState); // Persist
                    broadcast({ type: 'stateUpdated', state: appState });
                    break;

                case 'triggerAction':
                    // Just relay actions like "showWinners", "showQuestion" to everyone
                    broadcast({ ...data, from: 'control' });
                    break;

                case 'addPintarScore':
                    updatePintarScore(data.uniqueId, data.nickname, data.score);
                    broadcast({
                        type: 'updatePintar',
                        pintarScores: getPintarScores()
                    });
                    break;
            }
        } catch (err) {
            console.error('Message error:', err);
        }
    });
});

// --- TikTok Connection Logic ---

let tiktokWrapper = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

function tiktokStatus() {
    return tiktokWrapper ? (tiktokWrapper.isConnected ? 'connected' : 'connecting') : 'disconnected';
}

async function startTikTokConnection(username) {
    if (!username) return;

    // Save to DB so we can auto-reconnect on restart if desired (optional)
    appState.connectedUser = username;
    setState('appState', appState);

    // Stop existing
    stopTikTokConnection(false);

    reconnectAttempts = 0;
    connectToTikTok(username);
}

function stopTikTokConnection(clearUser = true) {
    if (tiktokWrapper) {
        tiktokWrapper.disconnect();
        tiktokWrapper = null;
    }
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }
    if (clearUser) {
        appState.connectedUser = null;
        setState('appState', appState);
    }
    broadcast({ type: 'tiktokStatus', status: 'disconnected' });
}

async function connectToTikTok(username) {
    console.log(`🔗 Connecting to @${username} (Attempt ${reconnectAttempts + 1})`);
    broadcast({ type: 'tiktokStatus', status: 'connecting' });

    const connection = new WebcastPushConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 2000
    });

    try {
        const state = await connection.connect();

        console.log(`✅ Connected to Room: ${state.roomId}`);
        reconnectAttempts = 0; // Reset on success

        tiktokWrapper = connection;
        broadcast({
            type: 'tiktokStatus',
            status: 'connected',
            viewerCount: state.viewerCount
        });

        // Event Handlers
        connection.on('chat', (data) => {
            broadcast({
                type: 'chat',
                data: {
                    uniqueId: data.uniqueId,
                    nickname: data.nickname,
                    comment: data.comment,
                    profilePictureUrl: data.profilePictureUrl,
                    timestamp: Date.now()
                }
            });
            // Note: Gameplay logic (checking answers) is on the client (ControlPanel)
            // or we could move it here to be even more robust.
            // For now, let's keep it simple: Server broadcasts events, Client processes.
        });

        connection.on('gift', (data) => {
            if (data.giftType === 1 && !data.repeatEnd) return;

            // Calculate score simple
            const coins = (data.giftName === 'Rose' ? 1 : data.diamondCount) || 1;

            // Allow Server to track Sultan scores immediately for persistence?
            // Actually, Control Panel currently calculates it. 
            // Better to let Control Panel tell Server to update DB to avoid double logic, 
            // OR move logic here. 
            // Move logic here for robustness:
            updateSultanScore(data.uniqueId, data.nickname, coins * (data.repeatCount || 1));

            broadcast({
                type: 'gift',
                data: {
                    ...data,
                    timestamp: Date.now()
                },
                sultanScores: getSultanScores() // Send updated scores
            });
        });

        connection.on('roomUser', (data) => {
            broadcast({ type: 'viewerCount', count: data.viewerCount });
        });

        connection.on('disconnected', () => {
            console.log('⚠️ TikTok Disconnected');
            handleReconnect(username);
        });

        connection.on('error', (err) => {
            console.error('TikTok Error:', err);
            handleReconnect(username);
        });

        // Also handle connection wrapper errors
        connection.wrapper?.on('close', () => handleReconnect(username));

    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        handleReconnect(username);
    }
}

function handleReconnect(username) {
    if (reconnectTimer) return; // Already scheduled

    // Stop current instance but keep State intention
    if (tiktokWrapper) {
        try { tiktokWrapper.disconnect(); } catch (e) { }
        tiktokWrapper = null;
    }

    const delay = Math.min(
        RECONNECT_DELAY_BASE * Math.pow(1.5, reconnectAttempts),
        RECONNECT_DELAY_MAX
    );

    console.log(`⏳ Reconnecting in ${delay / 1000}s...`);
    broadcast({ type: 'tiktokStatus', status: 'reconnecting', nextRetry: Date.now() + delay });

    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        reconnectAttempts++;
        connectToTikTok(username);
    }, delay);
}

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
