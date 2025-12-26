/**
 * TikTok Live Quiz - WebSocket Server
 * 
 * This server connects to TikTok Live via tiktok-live-connector
 * and broadcasts events to the React frontend via WebSocket.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { WebcastPushConnection } from 'tiktok-live-connector';

const PORT = 3001;

// Store active connections
let tiktokConnection = null;
let activeQuestion = null;
const clients = new Set();

// Gift values in coins
const giftValues = {
    'Rose': 1,
    'TikTok': 1,
    'GG': 1,
    'Ice Cream Cone': 1,
    'Heart': 5,
    'Finger Heart': 5,
    'Love you': 15,
    'Doughnut': 30,
    'Cap': 99,
    'Hand Hearts': 100,
    'Perfume': 200,
    'Garland': 500,
    'Marvelous Confetti': 1000,
    'Galaxy': 1000,
    'Interstellar': 10000,
    'Lion': 29999
};

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}`);

// Broadcast to all connected clients
function broadcast(data) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('📱 Client connected');
    clients.add(ws);

    // Send current connection status
    ws.send(JSON.stringify({
        type: tiktokConnection ? 'connected' : 'disconnected',
        viewerCount: 0
    }));

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());

            switch (data.type) {
                case 'connect':
                    await connectToTikTok(data.username);
                    break;

                case 'disconnect':
                    disconnectFromTikTok();
                    break;

                case 'setQuestion':
                    activeQuestion = data.question;
                    console.log(`📝 Active question set: ${activeQuestion?.id}`);
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (err) {
            console.error('Failed to parse message:', err);
        }
    });

    ws.on('close', () => {
        console.log('📴 Client disconnected');
        clients.delete(ws);
    });
});

// Connect to TikTok Live
async function connectToTikTok(username) {
    if (!username) {
        broadcast({ type: 'error', message: 'Username diperlukan' });
        return;
    }

    // Disconnect existing connection
    if (tiktokConnection) {
        tiktokConnection.disconnect();
    }

    console.log(`🔗 Connecting to TikTok: @${username}`);

    tiktokConnection = new WebcastPushConnection(username, {
        processInitialData: true,
        enableExtendedGiftInfo: true,
        enableWebsocketUpgrade: true,
        requestPollingIntervalMs: 2000,
        sessionId: undefined
    });

    try {
        const state = await tiktokConnection.connect();

        console.log(`✅ Connected to TikTok Live!`);
        console.log(`   Room ID: ${state.roomId}`);
        console.log(`   Viewers: ${state.viewerCount}`);

        broadcast({
            type: 'connected',
            roomId: state.roomId,
            viewerCount: state.viewerCount
        });

        // Listen for chat messages
        tiktokConnection.on('chat', (data) => {
            console.log(`💬 ${data.uniqueId}: ${data.comment}`);

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
        });

        // Listen for gifts
        tiktokConnection.on('gift', (data) => {
            // For gifts without repeat status, only process if repeatEnd is true
            if (data.giftType === 1 && !data.repeatEnd) {
                return;
            }

            const coins = giftValues[data.giftName] || data.diamondCount || 1;

            console.log(`🎁 ${data.uniqueId} sent ${data.giftName} x${data.repeatCount} (${coins} coins)`);

            broadcast({
                type: 'gift',
                data: {
                    uniqueId: data.uniqueId,
                    nickname: data.nickname,
                    giftName: data.giftName,
                    giftPictureUrl: data.giftPictureUrl,
                    diamondCount: data.diamondCount,
                    repeatCount: data.repeatCount || 1,
                    coins: coins * (data.repeatCount || 1),
                    timestamp: Date.now()
                }
            });
        });

        // Listen for viewer count updates
        tiktokConnection.on('roomUser', (data) => {
            broadcast({
                type: 'roomUser',
                viewerCount: data.viewerCount
            });
        });

        // Listen for likes
        tiktokConnection.on('like', (data) => {
            console.log(`❤️ ${data.uniqueId} liked (${data.likeCount} total)`);
        });

        // Listen for follows
        tiktokConnection.on('follow', (data) => {
            console.log(`➕ ${data.uniqueId} followed`);
        });

        // Listen for share
        tiktokConnection.on('share', (data) => {
            console.log(`📤 ${data.uniqueId} shared`);
        });

        // Handle disconnect
        tiktokConnection.on('disconnected', () => {
            console.log('❌ Disconnected from TikTok');
            broadcast({ type: 'disconnected' });
            tiktokConnection = null;
        });

        // Handle errors
        tiktokConnection.on('error', (err) => {
            console.error('TikTok error:', err);
            broadcast({ type: 'error', message: err.message });
        });

    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        broadcast({
            type: 'error',
            message: `Gagal connect ke @${username}: ${err.message}`
        });
        tiktokConnection = null;
    }
}

// Disconnect from TikTok
function disconnectFromTikTok() {
    if (tiktokConnection) {
        tiktokConnection.disconnect();
        tiktokConnection = null;
        console.log('🔌 Disconnected from TikTok');
        broadcast({ type: 'disconnected' });
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    disconnectFromTikTok();
    wss.close();
    process.exit(0);
});
