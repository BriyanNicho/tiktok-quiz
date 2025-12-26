import { useState, useEffect } from 'react';
import { Crown, Brain, Sparkles, Trophy } from 'lucide-react';

function LeaderboardItem({ rank, user, score, type = 'pintar', isTop = false }) {
    const isPintar = type === 'pintar';

    const getRankBadge = () => {
        if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
        if (rank === 2) return <span className="text-slate-300 font-bold">2</span>;
        if (rank === 3) return <span className="text-amber-600 font-bold">3</span>;
        return <span className="text-slate-500 font-medium">{rank}</span>;
    };

    return (
        <div
            className={`leaderboard-item flex items-center gap-3 p-3 rounded-lg ${isTop
                    ? isPintar
                        ? 'bg-cyan-950/50 border border-cyan-800/50'
                        : 'bg-amber-950/50 border border-amber-800/50'
                    : 'bg-slate-900/50'
                } ${rank === 1 ? 'animate-pulse-glow glow-' + (isPintar ? 'cyan' : 'amber') : ''}`}
        >
            {/* Rank */}
            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${rank === 1
                    ? isPintar ? 'bg-cyan-500' : 'bg-amber-500'
                    : 'bg-slate-800'
                }`}>
                {getRankBadge()}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${rank === 1
                        ? isPintar ? 'text-cyan-300' : 'text-amber-300'
                        : 'text-slate-200'
                    }`}>
                    {user.nickname || user.uniqueId}
                </p>
                {user.profilePictureUrl && (
                    <div className="w-6 h-6 rounded-full overflow-hidden hidden">
                        <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Score */}
            <div className={`text-right ${isPintar ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                <span className="font-bold text-lg">{score}</span>
                <span className="text-xs text-slate-500 ml-1">
                    {isPintar ? 'pts' : '🪙'}
                </span>
            </div>
        </div>
    );
}

export default function Leaderboard({
    pintarData = [],
    sultanData = [],
    showBoth = true,
    maxItems = 5
}) {
    const sortedPintar = [...pintarData]
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);

    const sortedSultan = [...sultanData]
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);

    return (
        <div className={`${showBoth ? 'grid grid-cols-1 gap-4' : ''}`}>
            {/* Pintar Leaderboard */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg gradient-pintar">
                        <Brain className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                        <h3 className="font-bold text-cyan-400">Peringkat Pintar</h3>
                        <p className="text-xs text-slate-500">Jawaban Tercepat & Benar</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {sortedPintar.length > 0 ? (
                        sortedPintar.map((item, index) => (
                            <LeaderboardItem
                                key={item.uniqueId || index}
                                rank={index + 1}
                                user={item}
                                score={item.score}
                                type="pintar"
                                isTop={index < 3}
                            />
                        ))
                    ) : (
                        <div className="text-center py-6 text-slate-600">
                            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Belum ada jawaban benar</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sultan Leaderboard */}
            {showBoth && (
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg gradient-sultan">
                            <Sparkles className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-400">Peringkat Sultan</h3>
                            <p className="text-xs text-slate-500">Top Supporters</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {sortedSultan.length > 0 ? (
                            sortedSultan.map((item, index) => (
                                <LeaderboardItem
                                    key={item.uniqueId || index}
                                    rank={index + 1}
                                    user={item}
                                    score={item.score}
                                    type="sultan"
                                    isTop={index < 3}
                                />
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-600">
                                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Belum ada gift</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
