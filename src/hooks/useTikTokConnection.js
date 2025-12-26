import { useState, useEffect, useCallback } from 'react';

const WS_URL = 'ws://localhost:3001';

export function useTikTokConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [socket, setSocket] = useState(null);

    // Event callbacks
    const [onChat, setOnChat] = useState(null);
    const [onGift, setOnGift] = useState(null);

    // Connect to WebSocket server
    const connect = useCallback((username) => {
        if (socket) {
            socket.close();
        }

        setIsConnecting(true);
        setError(null);

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            // Send connect request with TikTok username
            ws.send(JSON.stringify({
                type: 'connect',
                username
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'connected':
                        setIsConnected(true);
                        setIsConnecting(false);
                        setViewerCount(data.viewerCount || 0);
                        break;

                    case 'error':
                        setError(data.message);
                        setIsConnecting(false);
                        setIsConnected(false);
                        break;

                    case 'chat':
                        if (onChat) onChat(data.data);
                        break;

                    case 'gift':
                        if (onGift) onGift(data.data);
                        break;

                    case 'roomUser':
                        setViewerCount(data.viewerCount || 0);
                        break;

                    default:
                        console.log('Unknown message type:', data.type);
                }
            } catch (err) {
                console.error('Failed to parse message:', err);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            setError('Koneksi WebSocket gagal');
            setIsConnecting(false);
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setIsConnected(false);
            setIsConnecting(false);
        };

        setSocket(ws);
    }, [socket, onChat, onGift]);

    // Disconnect
    const disconnect = useCallback(() => {
        if (socket) {
            socket.send(JSON.stringify({ type: 'disconnect' }));
            socket.close();
            setSocket(null);
            setIsConnected(false);
        }
    }, [socket]);

    // Send message to server
    const sendMessage = useCallback((type, payload) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type, ...payload }));
        }
    }, [socket]);

    // Set active question (for answer tracking)
    const setActiveQuestion = useCallback((question) => {
        sendMessage('setQuestion', { question });
    }, [sendMessage]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [socket]);

    return {
        // Connection state
        isConnected,
        isConnecting,
        error,
        viewerCount,

        // Actions
        connect,
        disconnect,
        sendMessage,
        setActiveQuestion,

        // Event handlers setters
        setOnChat: (handler) => setOnChat(() => handler),
        setOnGift: (handler) => setOnGift(() => handler)
    };
}

// Mock connection for testing without server
export function useMockTikTokConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [onChat, setOnChat] = useState(null);
    const [onGift, setOnGift] = useState(null);

    const mockUsers = [
        { uniqueId: 'user123', nickname: 'Ahmad' },
        { uniqueId: 'muslimah22', nickname: 'Fatimah' },
        { uniqueId: 'student_arabic', nickname: 'Umar' },
        { uniqueId: 'pojok_fan', nickname: 'Khadijah' },
        { uniqueId: 'arabic_lover', nickname: 'Ali' }
    ];

    const mockGifts = [
        { giftName: 'Rose', diamondCount: 1, giftPictureUrl: null },
        { giftName: 'Heart', diamondCount: 5, giftPictureUrl: null },
        { giftName: 'Finger Heart', diamondCount: 5, giftPictureUrl: null },
        { giftName: 'Doughnut', diamondCount: 30, giftPictureUrl: null },
        { giftName: 'Hand Hearts', diamondCount: 100, giftPictureUrl: null }
    ];

    const connect = useCallback(() => {
        setIsConnected(true);
        setViewerCount(Math.floor(Math.random() * 50) + 10);
    }, []);

    const disconnect = useCallback(() => {
        setIsConnected(false);
        setViewerCount(0);
    }, []);

    // Simulate random chat answers
    const simulateAnswer = useCallback((answer) => {
        if (!isConnected || !onChat) return;

        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        onChat({
            ...user,
            comment: answer,
            timestamp: Date.now()
        });
    }, [isConnected, onChat]);

    // Simulate random gift
    const simulateGift = useCallback(() => {
        if (!isConnected || !onGift) return;

        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const gift = mockGifts[Math.floor(Math.random() * mockGifts.length)];

        onGift({
            ...user,
            ...gift,
            repeatCount: 1,
            coins: gift.diamondCount,
            timestamp: Date.now()
        });
    }, [isConnected, onGift]);

    return {
        isConnected,
        isConnecting: false,
        error: null,
        viewerCount,
        connect,
        disconnect,
        setActiveQuestion: () => { },
        setOnChat: (handler) => setOnChat(() => handler),
        setOnGift: (handler) => setOnGift(() => handler),

        // Mock-specific methods
        simulateAnswer,
        simulateGift
    };
}
