import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

export default function QuizCard({
    question,
    showAnswer = false,
    isActive = true
}) {
    const [revealed, setRevealed] = useState(showAnswer);

    useEffect(() => {
        setRevealed(showAnswer);
    }, [showAnswer]);

    if (!question) {
        return (
            <div className="glass-card-strong p-8 text-center animate-fade-in">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-xl font-semibold text-slate-400">
                    Menunggu soal berikutnya...
                </h2>
                <p className="text-slate-600 mt-2">
                    Host akan menampilkan soal sebentar lagi
                </p>
            </div>
        );
    }

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <div className={`glass-card-strong p-6 animate-slide-up ${isActive ? 'glow-cyan' : ''
            }`}>
            {/* Question Number */}
            <div className="flex items-center justify-between mb-4">
                <span className="badge-pintar">
                    Soal #{question.id}
                </span>
                {revealed && (
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" /> Jawaban Ditampilkan
                    </span>
                )}
            </div>

            {/* Arabic Text */}
            <div className="mb-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="font-arabic text-3xl md:text-4xl text-amber-300 leading-relaxed text-glow-amber">
                    {question.arabic}
                </p>
            </div>

            {/* Indonesian Question */}
            <p className="text-lg md:text-xl text-slate-200 mb-6 font-medium">
                {question.indonesian}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
                {question.options.map((option, index) => {
                    const isCorrect = index === question.correctAnswer;
                    const showCorrect = revealed && isCorrect;
                    const showWrong = revealed && !isCorrect;

                    return (
                        <div
                            key={index}
                            className={`answer-option flex items-center gap-3 ${showCorrect ? 'correct' : ''
                                } ${showWrong ? 'opacity-50' : ''}`}
                        >
                            {/* Option Label */}
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${showCorrect
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-700 text-slate-300'
                                }`}>
                                {showCorrect ? <Check className="w-5 h-5" /> : optionLabels[index]}
                            </div>

                            {/* Option Text */}
                            <span className={`flex-1 ${showCorrect ? 'text-emerald-300 font-semibold' : 'text-slate-200'
                                }`}>
                                {option}
                            </span>

                            {/* Indicators */}
                            {showCorrect && (
                                <span className="text-emerald-400 text-sm font-medium">
                                    ✓ Benar
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Answer Instructions */}
            {!revealed && isActive && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-center text-slate-500 text-sm">
                        💬 Ketik <span className="text-cyan-400 font-bold">A</span>,
                        <span className="text-cyan-400 font-bold"> B</span>, atau
                        <span className="text-cyan-400 font-bold"> C</span> di chat untuk menjawab!
                    </p>
                </div>
            )}
        </div>
    );
}
