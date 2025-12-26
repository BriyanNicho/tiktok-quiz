import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useTikTokConnection } from '../hooks/useTikTokConnection';
import { useSoundEffects } from '../hooks/useSoundEffects';
import QuizCard from '../components/QuizCard';
import Timer from '../components/Timer';
import Leaderboard from '../components/Leaderboard';
import GiftNotification from '../components/GiftNotification';
import WinnerCelebration from '../components/WinnerCelebration';

export default function Overlay() {
    const {
        serverState,
        serverPintarScores,
        serverSultanScores,
        setOnGift,
        setOnAction
    } = useTikTokConnection();

    const { playWinner, playCombo, playGift } = useSoundEffects();

    // Local derived state
    const [giftQueue, setGiftQueue] = useState([]);
    const [currentGift, setCurrentGift] = useState(null);
    const [showWinners, setShowWinners] = useState(false);

    // Synced State
    const activeQuestion = serverState?.activeQuestion || null;
    const isActive = serverState?.isActive || false;
    const timerEndTime = serverState?.timerEndTime || 0;

    // Handle Gift Queue
    useEffect(() => {
        setOnGift((gift) => {
            setGiftQueue(prev => [...prev, gift]);
            playGift();
        });
    }, [setOnGift, playGift]);

    // Handle Actions (Winners, etc)
    useEffect(() => {
        setOnAction((msg) => {
            if (msg.actionType === 'showWinners') {
                setShowWinners(true);
                playWinner();
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
            if (msg.actionType === 'showQuestion') {
                setShowWinners(false);
            }
            if (msg.actionType === 'showCombo') {
                playCombo();
                confetti({
                    particleCount: 50,
                    spread: 40,
                    startVelocity: 30,
                    origin: { y: 0.8 },
                    colors: ['#22d3ee', '#fbbf24']
                });
            }
        });
    }, [setOnAction, playWinner, playCombo]);

    // Process Gift Queue
    useEffect(() => {
        if (giftQueue.length > 0 && !currentGift) {
            setCurrentGift(giftQueue[0]);
            setGiftQueue(prev => prev.slice(1));
        }
    }, [giftQueue, currentGift]);

    // Timer Sync
    const [timeRemaining, setTimeRemaining] = useState(0);
    useEffect(() => {
        if (isActive && timerEndTime) {
            const update = () => {
                const left = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
                setTimeRemaining(left);
            };
            update(); // immediate

            const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
            setTimeRemaining(remaining);
        }
    }, [isActive, timerEndTime]);

    return (
        <div className="overlay-container gradient-premium min-h-screen overflow-hidden">
            <div className="tiktok-safe-zone h-full flex flex-col p-4">

                {/* Header Info */}
                <div className="mb-4 text-center transition-all duration-300">
                    {activeQuestion && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card animate-slide-down">
                            <span className="text-cyan-400 font-bold">
                                Soal {serverState?.questionIndex + 1 || '?'}
                            </span>
                            {serverState?.totalQuestions && (
                                <>
                                    <span className="text-slate-600">/</span>
                                    <span className="text-slate-400">{serverState.totalQuestions}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Quiz Card */}
                <div className="flex-shrink-0 mb-4 transform scale-100 transition-transform">
                    <QuizCard
                        question={activeQuestion}
                        showAnswer={!isActive && activeQuestion} // Show answer if not active but we have a question (and haven't moved to next)
                        isActive={isActive}
                    />
                </div>

                {/* Timer */}
                {isActive && activeQuestion && timeRemaining > 0 && (
                    <div className="mb-6 animate-fade-in">
                        {/* 
                           We key by timerEndTime so if it changes, timer resets.
                           We pass calculated 'remaining' as duration so it picks up where it left off.
                        */}
                        <Timer
                            key={timerEndTime}
                            duration={timeRemaining}
                            isActive={isActive}
                            onComplete={() => { }}
                        />
                    </div>
                )}

                {/* Leaderboards */}
                <div className="flex-1 overflow-hidden mt-4">
                    <Leaderboard
                        pintarData={serverPintarScores}
                        sultanData={serverSultanScores}
                        showBoth={true}
                        maxItems={5}
                    />
                </div>
            </div>

            {/* Overlays */}
            {currentGift && (
                <GiftNotification
                    gift={currentGift}
                    onComplete={() => setCurrentGift(null)}
                />
            )}

            <WinnerCelebration
                pintarWinners={serverPintarScores.slice(0, 3)}
                sultanWinners={serverSultanScores.slice(0, 3)}
                isVisible={showWinners}
                onClose={() => setShowWinners(false)}
            />
        </div>
    );
}
