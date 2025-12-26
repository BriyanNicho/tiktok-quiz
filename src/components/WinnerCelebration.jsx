import { useState, useEffect } from 'react';
import { Trophy, Crown, Star, Sparkles, Brain } from 'lucide-react';

function ConfettiPiece({ delay, color }) {
    const randomX = Math.random() * 100;
    const randomDuration = 2 + Math.random() * 2;

    return (
        <div
            className="absolute w-3 h-3 rounded-sm"
            style={{
                left: `${randomX}%`,
                top: '-10px',
                backgroundColor: color,
                animation: `confettiFall ${randomDuration}s ease-in-out ${delay}s infinite`,
                transform: `rotate(${Math.random() * 360}deg)`
            }}
        />
    );
}

function WinnerCard({ winner, rank, type = 'pintar' }) {
    const isPintar = type === 'pintar';
    const isFirst = rank === 1;

    const getRankIcon = () => {
        if (rank === 1) return <Crown className="w-8 h-8" />;
        if (rank === 2) return <Trophy className="w-6 h-6" />;
        return <Star className="w-5 h-5" />;
    };

    return (
        <div
            className={`text-center p-4 rounded-xl ${isFirst
                    ? isPintar
                        ? 'glass-card glow-cyan scale-110'
                        : 'glass-card glow-amber scale-110'
                    : 'glass-card opacity-80'
                } ${isFirst ? 'animate-celebrate' : ''}`}
            style={{
                animationDelay: `${rank * 0.2}s`,
                order: rank === 1 ? 0 : rank
            }}
        >
            {/* Rank Badge */}
            <div className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center ${isFirst
                    ? isPintar ? 'gradient-pintar' : 'gradient-sultan'
                    : 'bg-slate-700'
                }`}>
                {getRankIcon()}
            </div>

            {/* Winner Name */}
            <h4 className={`font-bold text-lg truncate ${isPintar ? 'text-cyan-300' : 'text-amber-300'
                }`}>
                {winner.nickname || winner.uniqueId}
            </h4>

            {/* Score */}
            <p className={`text-2xl font-bold mt-1 ${isPintar ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                {winner.score}
                <span className="text-sm ml-1">{isPintar ? 'pts' : '🪙'}</span>
            </p>

            {/* Rank Label */}
            <p className="text-slate-500 text-sm mt-2">
                #{rank} {isPintar ? 'Terpintar' : 'Sultan'}
            </p>
        </div>
    );
}

export default function WinnerCelebration({
    pintarWinners = [],
    sultanWinners = [],
    isVisible = false,
    onClose
}) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShowConfetti(true);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    const confettiColors = ['#22d3ee', '#fbbf24', '#34d399', '#fb7185', '#a78bfa'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
            {/* Confetti */}
            {showConfetti && (
                <div className="confetti-container">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <ConfettiPiece
                            key={i}
                            delay={Math.random() * 2}
                            color={confettiColors[i % confettiColors.length]}
                        />
                    ))}
                </div>
            )}

            <div className="max-w-2xl w-full mx-4 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-4xl font-bold mb-2">
                        <span className="text-cyan-400">Selamat</span> kepada{' '}
                        <span className="text-amber-400">Pemenang!</span>
                    </h2>
                    <p className="text-slate-400">Terima kasih sudah berpartisipasi dalam kuis hari ini</p>
                </div>

                {/* Pintar Winners */}
                {pintarWinners.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Brain className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-xl font-bold text-cyan-400">Peringkat Pintar</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-end">
                            {pintarWinners.slice(0, 3).map((winner, index) => (
                                <WinnerCard
                                    key={winner.uniqueId || index}
                                    winner={winner}
                                    rank={index + 1}
                                    type="pintar"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Sultan Winners */}
                {sultanWinners.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Sparkles className="w-6 h-6 text-amber-400" />
                            <h3 className="text-xl font-bold text-amber-400">Peringkat Sultan</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-end">
                            {sultanWinners.slice(0, 3).map((winner, index) => (
                                <WinnerCard
                                    key={winner.uniqueId || index}
                                    winner={winner}
                                    rank={index + 1}
                                    type="sultan"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Close Button */}
                {onClose && (
                    <div className="text-center">
                        <button onClick={onClose} className="btn-secondary">
                            Tutup
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
