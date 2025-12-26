import { useState, useEffect } from 'react';

export default function Timer({ duration = 15, isActive = true, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(isActive);

    useEffect(() => {
        setTimeLeft(duration);
        setIsRunning(isActive);
    }, [duration, isActive]);

    useEffect(() => {
        if (!isRunning || timeLeft <= 0) {
            if (timeLeft <= 0 && onComplete) {
                onComplete();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, onComplete]);

    const percentage = (timeLeft / duration) * 100;
    const isUrgent = timeLeft <= 5;

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full timer-progress rounded-full ${isUrgent
                            ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                            : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Time Display */}
            <div className={`text-center ${isUrgent ? 'animate-pulse' : ''}`}>
                <span className={`text-3xl font-bold ${isUrgent ? 'text-rose-400 text-glow-amber' : 'text-cyan-400'
                    }`}>
                    {timeLeft}
                </span>
                <span className="text-slate-500 text-lg ml-1">detik</span>
            </div>
        </div>
    );
}
