import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Play, Pause, SkipForward, SkipBack, Eye, EyeOff,
    Trophy, Plus, Upload, Trash2, Edit, Users, Wifi, WifiOff,
    RefreshCw, Download, Settings, ArrowLeft, Check, X
} from 'lucide-react';
import { useQuestionManager } from '../hooks/useQuestionManager';
import { useMockTikTokConnection } from '../hooks/useTikTokConnection';
import QuestionForm from '../components/QuestionForm';
import CsvUploader from '../components/CsvUploader';
import QuizCard from '../components/QuizCard';

export default function ControlPanel() {
    // Question management
    const {
        questions,
        currentQuestion,
        currentIndex,
        totalQuestions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importFromCsv,
        exportToCsv,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        resetToSample
    } = useQuestionManager();

    // TikTok connection (using mock for testing)
    const {
        isConnected,
        isConnecting,
        viewerCount,
        connect,
        disconnect,
        simulateAnswer,
        simulateGift,
        setOnChat,
        setOnGift
    } = useMockTikTokConnection();

    // UI state
    const [activeTab, setActiveTab] = useState('control'); // control, questions, settings
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showCsvUploader, setShowCsvUploader] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [tiktokUsername, setTiktokUsername] = useState('');

    // Quiz state
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    // Scores
    const [pintarScores, setPintarScores] = useState([]);
    const [sultanScores, setSultanScores] = useState([]);
    const [answeredUsers, setAnsweredUsers] = useState(new Set());

    // Broadcast channel for Overlay communication
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        const bc = new BroadcastChannel('quiz_channel');
        setChannel(bc);
        return () => bc.close();
    }, []);

    const broadcast = useCallback((command) => {
        if (channel) {
            channel.postMessage(command);
        }
        // Also use localStorage for cross-origin
        localStorage.setItem('quiz_control', JSON.stringify({ ...command, timestamp: Date.now() }));
    }, [channel]);

    // Handle chat messages (answers)
    useEffect(() => {
        setOnChat((msg) => {
            if (!isQuizActive || !currentQuestion) return;

            const answer = msg.comment.trim().toUpperCase();
            if (!['A', 'B', 'C'].includes(answer)) return;

            // Check if user already answered this question
            if (answeredUsers.has(msg.uniqueId)) return;

            const answerIndex = ['A', 'B', 'C'].indexOf(answer);
            const isCorrect = answerIndex === currentQuestion.correctAnswer;

            if (isCorrect) {
                // Add to Pintar leaderboard
                setPintarScores(prev => {
                    const existing = prev.find(u => u.uniqueId === msg.uniqueId);
                    if (existing) {
                        return prev.map(u =>
                            u.uniqueId === msg.uniqueId
                                ? { ...u, score: u.score + 10 }
                                : u
                        ).sort((a, b) => b.score - a.score);
                    }
                    return [...prev, {
                        uniqueId: msg.uniqueId,
                        nickname: msg.nickname,
                        score: 10
                    }].sort((a, b) => b.score - a.score);
                });

                setAnsweredUsers(prev => new Set([...prev, msg.uniqueId]));

                // Broadcast updated scores
                setTimeout(() => {
                    broadcast({ type: 'updatePintar', data: pintarScores });
                }, 100);
            }
        });
    }, [isQuizActive, currentQuestion, answeredUsers, setOnChat, broadcast, pintarScores]);

    // Handle gifts
    useEffect(() => {
        setOnGift((gift) => {
            // Add to Sultan leaderboard
            setSultanScores(prev => {
                const existing = prev.find(u => u.uniqueId === gift.uniqueId);
                const coins = gift.coins || gift.diamondCount || 1;

                if (existing) {
                    return prev.map(u =>
                        u.uniqueId === gift.uniqueId
                            ? { ...u, score: u.score + coins }
                            : u
                    ).sort((a, b) => b.score - a.score);
                }
                return [...prev, {
                    uniqueId: gift.uniqueId,
                    nickname: gift.nickname,
                    score: coins
                }].sort((a, b) => b.score - a.score);
            });

            // Show gift notification on overlay
            broadcast({ type: 'showGift', data: gift });

            // Broadcast updated scores
            setTimeout(() => {
                broadcast({ type: 'updateSultan', data: sultanScores });
            }, 100);
        });
    }, [setOnGift, broadcast, sultanScores]);

    // Control Functions
    const handleShowQuestion = () => {
        setIsQuizActive(true);
        setShowAnswer(false);
        setAnsweredUsers(new Set());
        broadcast({
            type: 'showQuestion',
            question: currentQuestion,
            index: currentIndex,
            total: totalQuestions
        });
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
        setIsQuizActive(false);
        broadcast({
            type: 'showAnswer',
            question: currentQuestion,
            index: currentIndex,
            total: totalQuestions
        });
    };

    const handleNextQuestion = () => {
        if (nextQuestion()) {
            setShowAnswer(false);
            setIsQuizActive(false);
            setAnsweredUsers(new Set());
            // Send update with next question data
            setTimeout(() => {
                broadcast({
                    type: 'updateQuestion',
                    question: questions[currentIndex + 1],
                    index: currentIndex + 1,
                    total: totalQuestions
                });
            }, 50);
        }
    };

    const handlePrevQuestion = () => {
        if (prevQuestion()) {
            setShowAnswer(false);
            setIsQuizActive(false);
            setAnsweredUsers(new Set());
            // Send update with prev question data
            setTimeout(() => {
                broadcast({
                    type: 'updateQuestion',
                    question: questions[currentIndex - 1],
                    index: currentIndex - 1,
                    total: totalQuestions
                });
            }, 50);
        }
    };

    const handleShowWinners = () => {
        broadcast({ type: 'updatePintar', data: pintarScores });
        broadcast({ type: 'updateSultan', data: sultanScores });
        broadcast({ type: 'showWinners' });
    };

    // Handle direct question navigation (clicking number buttons)
    const handleGoToQuestion = (index) => {
        goToQuestion(index);
        setShowAnswer(false);
        setIsQuizActive(false);
        setAnsweredUsers(new Set());
        // Send update with new question data
        setTimeout(() => {
            broadcast({
                type: 'updateQuestion',
                question: questions[index],
                index: index,
                total: totalQuestions
            });
        }, 50);
    };

    const handleResetScores = () => {
        if (confirm('Reset semua skor?')) {
            setPintarScores([]);
            setSultanScores([]);
            setAnsweredUsers(new Set());
            broadcast({ type: 'updatePintar', data: [] });
            broadcast({ type: 'updateSultan', data: [] });
        }
    };

    // Question management handlers
    const handleSaveQuestion = (data) => {
        if (editingQuestion) {
            updateQuestion(editingQuestion.id, data);
        } else {
            addQuestion(data);
        }
        setShowQuestionForm(false);
        setEditingQuestion(null);
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setShowQuestionForm(true);
    };

    const handleDeleteQuestion = (id) => {
        if (confirm('Hapus soal ini?')) {
            deleteQuestion(id);
        }
    };

    const handleImportCsv = (newQuestions) => {
        const count = importFromCsv(newQuestions, false);
        setShowCsvUploader(false);
        alert(`${count} soal berhasil diimport!`);
    };

    return (
        <div className="min-h-screen gradient-premium p-4 md:p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="btn-secondary p-2">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                <span className="text-cyan-400">Host</span> Control Panel
                            </h1>
                            <p className="text-slate-500 text-sm">Kelola kuis TikTok Live kamu</p>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-emerald-950 border border-emerald-700' : 'bg-slate-900'
                            }`}>
                            {isConnected ? (
                                <>
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Connected</span>
                                    <span className="text-slate-400 text-sm">|</span>
                                    <Users className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-300 text-sm">{viewerCount}</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-500 text-sm">Disconnected</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-6xl mx-auto mb-6">
                <div className="tab-nav">
                    <button
                        className={`tab-item ${activeTab === 'control' ? 'active' : ''}`}
                        onClick={() => setActiveTab('control')}
                    >
                        🎮 Kontrol Kuis
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'questions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('questions')}
                    >
                        📝 Kelola Soal ({totalQuestions})
                    </button>
                    <button
                        className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ Pengaturan
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Control Tab */}
                {activeTab === 'control' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Question Preview */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Question Card Preview */}
                            <div className="glass-card p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-300">Preview Soal</h3>
                                    <span className="text-sm text-slate-500">
                                        {currentIndex + 1} / {totalQuestions}
                                    </span>
                                </div>
                                <QuizCard
                                    question={currentQuestion}
                                    showAnswer={showAnswer}
                                    isActive={isQuizActive}
                                />
                            </div>

                            {/* Quiz Controls */}
                            <div className="glass-card p-4">
                                <h3 className="font-semibold text-slate-300 mb-4">Kontrol Soal</h3>

                                <div className="flex flex-wrap gap-3">
                                    {/* Navigation */}
                                    <button
                                        onClick={handlePrevQuestion}
                                        disabled={currentIndex === 0}
                                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <SkipBack className="w-4 h-4" />
                                        Prev
                                    </button>

                                    {/* Show/Hide Question */}
                                    {!isQuizActive ? (
                                        <button
                                            onClick={handleShowQuestion}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <Play className="w-4 h-4" />
                                            Tampilkan Soal
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleShowAnswer}
                                            className="btn-sultan flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Tampilkan Jawaban
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={currentIndex >= totalQuestions - 1}
                                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                                    >
                                        Next
                                        <SkipForward className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Question Selector */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {questions.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleGoToQuestion(i)}
                                            className={`question-number ${i === currentIndex
                                                ? 'bg-cyan-500 text-white'
                                                : 'hover:bg-slate-700'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Winner & Reset */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleShowWinners}
                                    className="btn-sultan flex-1 flex items-center justify-center gap-2"
                                >
                                    <Trophy className="w-5 h-5" />
                                    Show Winners
                                </button>
                                <button
                                    onClick={handleResetScores}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Reset Skor
                                </button>
                            </div>
                        </div>

                        {/* Right: Stats & Connection */}
                        <div className="space-y-4">
                            {/* Connection */}
                            <div className="glass-card p-4">
                                <h3 className="font-semibold text-slate-300 mb-4">Koneksi TikTok</h3>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={tiktokUsername}
                                        onChange={(e) => setTiktokUsername(e.target.value)}
                                        className="input-field"
                                        placeholder="Username TikTok"
                                        disabled={isConnected}
                                    />

                                    {!isConnected ? (
                                        <button
                                            onClick={() => connect(tiktokUsername)}
                                            disabled={isConnecting}
                                            className="btn-primary w-full"
                                        >
                                            {isConnecting ? 'Menghubungkan...' : 'Connect (Mock)'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={disconnect}
                                            className="btn-secondary w-full"
                                        >
                                            Disconnect
                                        </button>
                                    )}
                                </div>

                                {/* Mock Controls */}
                                {isConnected && (
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        <p className="text-xs text-slate-500 mb-3">Simulasi (Mode Testing)</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => simulateAnswer(['A', 'B', 'C'][Math.floor(Math.random() * 3)])}
                                                className="btn-secondary flex-1 text-sm"
                                            >
                                                💬 Jawab
                                            </button>
                                            <button
                                                onClick={simulateGift}
                                                className="btn-sultan flex-1 text-sm"
                                            >
                                                🎁 Gift
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="stats-card">
                                <h3 className="font-semibold text-slate-300 mb-4">Statistik</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-cyan-400">{pintarScores.length}</p>
                                        <p className="text-xs text-slate-500">Jawaban Benar</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-amber-400">{sultanScores.length}</p>
                                        <p className="text-xs text-slate-500">Total Gift</p>
                                    </div>
                                </div>
                            </div>

                            {/* Top Scores Preview */}
                            <div className="stats-card">
                                <h3 className="font-semibold text-slate-300 mb-3">Top 3 Pintar</h3>
                                {pintarScores.slice(0, 3).map((user, i) => (
                                    <div key={user.uniqueId} className="flex items-center justify-between py-1 text-sm">
                                        <span className="text-slate-400">#{i + 1} {user.nickname}</span>
                                        <span className="text-cyan-400 font-medium">{user.score}</span>
                                    </div>
                                ))}
                                {pintarScores.length === 0 && (
                                    <p className="text-slate-600 text-sm">Belum ada data</p>
                                )}
                            </div>

                            <div className="stats-card">
                                <h3 className="font-semibold text-slate-300 mb-3">Top 3 Sultan</h3>
                                {sultanScores.slice(0, 3).map((user, i) => (
                                    <div key={user.uniqueId} className="flex items-center justify-between py-1 text-sm">
                                        <span className="text-slate-400">#{i + 1} {user.nickname}</span>
                                        <span className="text-amber-400 font-medium">{user.score} 🪙</span>
                                    </div>
                                ))}
                                {sultanScores.length === 0 && (
                                    <p className="text-slate-600 text-sm">Belum ada data</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                    <div className="space-y-4">
                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => { setEditingQuestion(null); setShowQuestionForm(true); }}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Soal
                            </button>
                            <button
                                onClick={() => setShowCsvUploader(true)}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Import CSV
                            </button>
                            <button
                                onClick={exportToCsv}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Reset ke soal contoh?')) resetToSample();
                                }}
                                className="btn-secondary flex items-center gap-2 ml-auto"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset
                            </button>
                        </div>

                        {/* Question Form Modal */}
                        {showQuestionForm && (
                            <div className="glass-card p-6 animate-fade-in">
                                <h3 className="font-semibold text-lg mb-4">
                                    {editingQuestion ? 'Edit Soal' : 'Tambah Soal Baru'}
                                </h3>
                                <QuestionForm
                                    initialData={editingQuestion}
                                    onSave={handleSaveQuestion}
                                    onCancel={() => { setShowQuestionForm(false); setEditingQuestion(null); }}
                                />
                            </div>
                        )}

                        {/* CSV Uploader Modal */}
                        {showCsvUploader && (
                            <div className="glass-card p-6 animate-fade-in">
                                <h3 className="font-semibold text-lg mb-4">Import Soal dari CSV</h3>
                                <CsvUploader
                                    onImport={handleImportCsv}
                                    onCancel={() => setShowCsvUploader(false)}
                                />
                            </div>
                        )}

                        {/* Questions List */}
                        {!showQuestionForm && !showCsvUploader && (
                            <div className="glass-card overflow-hidden">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Pertanyaan</th>
                                            <th>Teks Arab</th>
                                            <th>Jawaban</th>
                                            <th>Timer</th>
                                            <th className="text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {questions.map((q, i) => (
                                            <tr key={q.id} className={i === currentIndex ? 'bg-cyan-950/30' : ''}>
                                                <td className="font-medium">{i + 1}</td>
                                                <td className="max-w-[200px] truncate">{q.indonesian}</td>
                                                <td className="font-arabic text-amber-300 max-w-[150px] truncate">{q.arabic}</td>
                                                <td>
                                                    <span className="badge-pintar">
                                                        {['A', 'B', 'C'][q.correctAnswer]}
                                                    </span>
                                                </td>
                                                <td>{q.timer}s</td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditQuestion(q)}
                                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4 text-slate-400" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(q.id)}
                                                            className="p-2 hover:bg-rose-950 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-rose-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="glass-card p-6 max-w-2xl">
                        <h3 className="font-semibold text-lg mb-6">Pengaturan</h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-slate-300 mb-2">Overlay URL</h4>
                                <p className="text-slate-500 text-sm mb-2">
                                    Gunakan URL ini di OBS/TikTok Live Studio sebagai Browser Source
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/overlay`}
                                        className="input-field flex-1"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/overlay`);
                                            alert('URL disalin!');
                                        }}
                                        className="btn-primary"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h4 className="font-medium text-slate-300 mb-2">Ukuran Overlay</h4>
                                <p className="text-slate-500 text-sm">
                                    Rekomendasi: <span className="text-cyan-400">1080 x 1920</span> (9:16 Vertical)
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h4 className="font-medium text-slate-300 mb-2">Cara Penggunaan</h4>
                                <ol className="text-slate-500 text-sm space-y-2 list-decimal list-inside">
                                    <li>Buka halaman Overlay di tab/window terpisah</li>
                                    <li>Di OBS, tambahkan Window Capture atau Browser Source</li>
                                    <li>Arahkan ke halaman Overlay</li>
                                    <li>Gunakan Control Panel ini untuk mengontrol kuis</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
