import { useState, useEffect } from 'react';
import { Gift, Heart, Sparkles } from 'lucide-react';

export default function GiftNotification({ gift, onComplete }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            if (onComplete) {
                setTimeout(onComplete, 300);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!gift) return null;

    return (
        <div className={`gift-notification ${isVisible ? 'animate-scale-in' : 'opacity-0 scale-90'} transition-all duration-300`}>
            <div className="glass-card-strong p-6 glow-amber text-center max-w-sm">
                {/* Sparkle Animation */}
                <div className="absolute -top-2 -right-2 animate-float">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
                <div className="absolute -bottom-2 -left-2 animate-float" style={{ animationDelay: '0.5s' }}>
                    <Sparkles className="w-6 h-6 text-amber-300" />
                </div>

                {/* Gift Icon */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-sultan flex items-center justify-center animate-celebrate">
                    {gift.giftPictureUrl ? (
                        <img
                            src={gift.giftPictureUrl}
                            alt={gift.giftName}
                            className="w-14 h-14 object-contain"
                        />
                    ) : (
                        <Gift className="w-10 h-10 text-slate-950" />
                    )}
                </div>

                {/* Thank You Message */}
                <h3 className="text-2xl font-bold text-amber-400 text-glow-amber mb-1">
                    شُكْرًا!
                </h3>
                <p className="text-amber-300 font-arabic text-lg mb-3">Syukron!</p>

                {/* Gift Details */}
                <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-slate-200 font-semibold">
                        {gift.nickname || gift.uniqueId}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        mengirim <span className="text-amber-400 font-medium">{gift.giftName}</span>
                        {gift.repeatCount > 1 && (
                            <span className="text-amber-300"> x{gift.repeatCount}</span>
                        )}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1 text-amber-400">
                        <span className="font-bold text-xl">+{gift.diamondCount || gift.coins}</span>
                        <span className="text-sm">🪙</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
