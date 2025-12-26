import { useState, useEffect, useCallback, useRef } from 'react';

const WS_URL = 'ws://localhost:3001';

export function useTikTokConnection() {
    const [status, setStatus] = useState('disconnected');
    const [viewerCount, setViewerCount] = useState(0);
    const [serverState, setServerState] = useState(null);
    const [serverPintarScores, setServerPintarScores] = useState([]);
    const [serverSultanScores, setServerSultanScores] = useState([]);

    const socketRef = useRef(null);

    // Refs for handlers to avoid effect dependencies
    const handlersRef = useRef({
        chat: null,
        gift: null,
        action: null
    });

    // Helper setters
    const setOnChat = useCallback((fn) => { handlersRef.current.chat = fn; }, []);
    const setOnGift = useCallback((fn) => { handlersRef.current.gift = fn; }, []);
    const setOnAction = useCallback((fn) => { handlersRef.current.action = fn; }, []);

    // Initial Connect
    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('✅ WebSocket Connected to Server');
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                // Handle generic triggers
                if ((msg.type === 'triggerAction' || msg.from === 'control') && handlersRef.current.action) {
                    handlersRef.current.action(msg);
                }

                switch (msg.type) {
                    case 'sync':
                        setServerState(msg.state);
                        setServerPintarScores(msg.pintarScores);
                        setServerSultanScores(msg.sultanScores);
                        setStatus(msg.tiktokStatus);
                        break;

                    case 'tiktokStatus':
                        setStatus(msg.status);
                        if (msg.viewerCount) setViewerCount(msg.viewerCount);
                        break;

                    case 'stateUpdated':
                        setServerState(msg.state);
                        break;

                    case 'chat':
                        if (handlersRef.current.chat) handlersRef.current.chat(msg.data);
                        break;

                    case 'gift':
                        if (handlersRef.current.gift) handlersRef.current.gift(msg.data);
                        if (msg.sultanScores) setServerSultanScores(msg.sultanScores);
                        break;

                    case 'viewerCount':
                        setViewerCount(msg.count);
                        break;

                    case 'updatePintar':
                        setServerPintarScores(msg.pintarScores);
                        break;

                    case 'updateSultan':
                        setServerSultanScores(msg.sultanScores);
                        break;
                }
            } catch (err) {
                console.error('WS Parse Error:', err);
            }
        };

        ws.onclose = () => {
            console.log('❌ WebSocket Disconnected');
            setStatus('disconnected');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
        };
    }, []); // Run once!

    const connect = useCallback((username) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'connect', username }));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'disconnect' }));
        }
        setStatus('disconnected');
    }, []);

    const updateServerState = useCallback((newState) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'updateState',
                state: newState
            }));
        }
    }, []);

    const triggerAction = useCallback((actionType, payload = {}) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'triggerAction',
                actionType,
                ...payload
            }));
        }
    }, []);

    const addScore = useCallback((uniqueId, nickname, score) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'addPintarScore',
                uniqueId, nickname, score
            }));
        }
    }, []);

    return {
        isConnected: status === 'connected',
        isConnecting: status === 'connecting' || status === 'reconnecting',
        status,
        viewerCount,
        serverState,
        serverPintarScores,
        serverSultanScores,

        connect,
        disconnect,
        updateServerState,
        triggerAction,
        addScore,

        setOnChat,
        setOnGift,
        setOnAction
    };
}

export function useMockTikTokConnection() {
    return useTikTokConnection();
}
