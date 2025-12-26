import { useState, useEffect, useCallback } from 'react';
import QuizCard from '../components/QuizCard';
import Timer from '../components/Timer';
import Leaderboard from '../components/Leaderboard';
import GiftNotification from '../components/GiftNotification';
import WinnerCelebration from '../components/WinnerCelebration';

export default function Overlay() {
    // Quiz state - received from Control Panel
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    // Leaderboards
    const [pintarScores, setPintarScores] = useState([]);
    const [sultanScores, setSultanScores] = useState([]);

    // Gift notification queue
    const [giftQueue, setGiftQueue] = useState([]);
    const [currentGift, setCurrentGift] = useState(null);

    // Winner celebration
    const [showWinners, setShowWinners] = useState(false);

    const handleCommand = useCallback((command) => {
        console.log('Overlay received command:', command);

        switch (command.type) {
            case 'showQuestion':
                // Receive question data from Control Panel
                if (command.question) {
                    setCurrentQuestion(command.question);
                    setCurrentIndex(command.index || 0);
                    setTotalQuestions(command.total || 0);
                }
                setShowAnswer(false);
                setIsQuizActive(true);
                setTimerKey(prev => prev + 1);
                break;

            case 'showAnswer':
                // Also update question data when showing answer
                if (command.question) {
                    setCurrentQuestion(command.question);
                    setCurrentIndex(command.index || 0);
                    setTotalQuestions(command.total || 0);
                }
                setShowAnswer(true);
                setIsQuizActive(false);
                break;

            case 'hideQuestion':
                setIsQuizActive(false);
                setShowAnswer(false);
                break;

            case 'updateQuestion':
                // Update question without changing quiz state
                if (command.question) {
                    setCurrentQuestion(command.question);
                    setCurrentIndex(command.index || 0);
                    setTotalQuestions(command.total || 0);
                }
                break;

            case 'updatePintar':
                setPintarScores(command.data || []);
                break;

            case 'updateSultan':
                setSultanScores(command.data || []);
                break;

            case 'showGift':
                setGiftQueue(prev => [...prev, command.data]);
                break;

            case 'showWinners':
                setShowWinners(true);
                break;

            case 'hideWinners':
                setShowWinners(false);
                break;

            default:
                console.log('Unknown command:', command);
        }
    }, []);

    // Listen for control panel messages via localStorage
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'quiz_control') {
                try {
                    const command = JSON.parse(e.newValue);
                    handleCommand(command);
                } catch { }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [handleCommand]);

    // BroadcastChannel for same-origin communication
    useEffect(() => {
        const channel = new BroadcastChannel('quiz_channel');

        channel.onmessage = (e) => {
            handleCommand(e.data);
        };

        return () => channel.close();
    }, [handleCommand]);

    // Process gift queue
    useEffect(() => {
        if (giftQueue.length > 0 && !currentGift) {
            setCurrentGift(giftQueue[0]);
            setGiftQueue(prev => prev.slice(1));
        }
    }, [giftQueue, currentGift]);

    const handleGiftComplete = () => {
        setCurrentGift(null);
    };

    const handleTimerComplete = () => {
        setShowAnswer(true);
        setIsQuizActive(false);
    };

    return (
        <div className="overlay-container gradient-premium min-h-screen">
            {/* TikTok Safe Zone */}
            <div className="tiktok-safe-zone h-full flex flex-col">
                {/* Header - Question Counter */}
                <div className="mb-4 text-center">
                    {currentQuestion && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
                            <span className="text-cyan-400 font-bold">Soal {currentIndex + 1}</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-400">{totalQuestions}</span>
                        </div>
                    )}
                </div>

                {/* Quiz Card */}
                <div className="flex-shrink-0 mb-4">
                    <QuizCard
                        question={currentQuestion}
                        showAnswer={showAnswer}
                        isActive={isQuizActive}
                    />
                </div>

                {/* Timer */}
                {isQuizActive && currentQuestion && (
                    <div className="mb-4 animate-fade-in">
                        <Timer
                            key={timerKey}
                            duration={currentQuestion.timer || 15}
                            isActive={isQuizActive && !showAnswer}
                            onComplete={handleTimerComplete}
                        />
                    </div>
                )}

                {/* Leaderboards */}
                <div className="flex-1 overflow-hidden">
                    <Leaderboard
                        pintarData={pintarScores}
                        sultanData={sultanScores}
                        showBoth={true}
                        maxItems={5}
                    />
                </div>
            </div>

            {/* Gift Notification */}
            {currentGift && (
                <GiftNotification
                    gift={currentGift}
                    onComplete={handleGiftComplete}
                />
            )}

            {/* Winner Celebration */}
            <WinnerCelebration
                pintarWinners={pintarScores.slice(0, 3)}
                sultanWinners={sultanScores.slice(0, 3)}
                isVisible={showWinners}
                onClose={() => setShowWinners(false)}
            />
        </div>
    );
}
