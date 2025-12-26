import { useState } from 'react';
import { Plus, Save, X, Eye } from 'lucide-react';

export default function QuestionForm({ onSave, onCancel, initialData = null }) {
    const [formData, setFormData] = useState(initialData || {
        arabic: '',
        indonesian: '',
        options: ['', '', ''],
        correctAnswer: 0,
        timer: 15
    });

    const [showPreview, setShowPreview] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.arabic.trim() || !formData.indonesian.trim()) {
            alert('Harap isi teks pertanyaan Arab dan Indonesia');
            return;
        }

        if (formData.options.some(opt => !opt.trim())) {
            alert('Harap isi semua pilihan jawaban');
            return;
        }

        onSave({
            ...formData,
            id: initialData?.id || Date.now()
        });
    };

    const optionLabels = ['A', 'B', 'C'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Arabic Question */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                    Teks Arab <span className="text-amber-400">(Amiri Font)</span>
                </label>
                <input
                    type="text"
                    value={formData.arabic}
                    onChange={(e) => handleChange('arabic', e.target.value)}
                    className="input-field font-arabic text-2xl text-amber-300"
                    placeholder="كَيْفَ حَالُكَ؟"
                    dir="rtl"
                />
            </div>

            {/* Indonesian Question */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                    Pertanyaan Indonesia
                </label>
                <input
                    type="text"
                    value={formData.indonesian}
                    onChange={(e) => handleChange('indonesian', e.target.value)}
                    className="input-field"
                    placeholder="Apa arti 'Kaifa haluk'?"
                />
            </div>

            {/* Answer Options */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                    Pilihan Jawaban
                </label>
                <div className="space-y-3">
                    {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${formData.correctAnswer === index
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-700 text-slate-300'
                                }`}>
                                {optionLabels[index]}
                            </div>
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="input-field flex-1"
                                placeholder={`Pilihan ${optionLabels[index]}`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Correct Answer */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        Jawaban Benar
                    </label>
                    <select
                        value={formData.correctAnswer}
                        onChange={(e) => handleChange('correctAnswer', parseInt(e.target.value))}
                        className="input-field"
                    >
                        <option value={0}>A - {formData.options[0] || 'Pilihan A'}</option>
                        <option value={1}>B - {formData.options[1] || 'Pilihan B'}</option>
                        <option value={2}>C - {formData.options[2] || 'Pilihan C'}</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                        Timer (detik)
                    </label>
                    <input
                        type="number"
                        value={formData.timer}
                        onChange={(e) => handleChange('timer', parseInt(e.target.value) || 15)}
                        className="input-field"
                        min="5"
                        max="60"
                    />
                </div>
            </div>

            {/* Preview Toggle */}
            <div className="border-t border-slate-800 pt-4">
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-secondary flex items-center gap-2 mb-4"
                >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Sembunyikan' : 'Lihat'} Preview
                </button>

                {showPreview && (
                    <div className="glass-card p-4 animate-fade-in">
                        <div className="bg-slate-900/60 p-4 rounded-xl mb-4">
                            <p className="font-arabic text-2xl text-amber-300 text-right">
                                {formData.arabic || '(Teks Arab)'}
                            </p>
                        </div>
                        <p className="text-slate-200 mb-4">
                            {formData.indonesian || '(Pertanyaan Indonesia)'}
                        </p>
                        <div className="space-y-2">
                            {formData.options.map((opt, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-lg flex items-center gap-2 ${formData.correctAnswer === i
                                            ? 'bg-emerald-900/30 border border-emerald-700'
                                            : 'bg-slate-800/50'
                                        }`}
                                >
                                    <span className="font-bold text-slate-400">{optionLabels[i]}.</span>
                                    <span>{opt || `Pilihan ${optionLabels[i]}`}</span>
                                    {formData.correctAnswer === i && (
                                        <span className="ml-auto text-emerald-400 text-xs">✓ Benar</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {initialData ? 'Update Soal' : 'Simpan Soal'}
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="btn-secondary">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </form>
    );
}
