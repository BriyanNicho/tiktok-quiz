import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Check, X, Download } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';

export default function CsvUploader({ onImport, onCancel }) {
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    const handleFileInput = (e) => {
        const selectedFile = e.target.files[0];
        handleFile(selectedFile);
    };

    const handleFile = async (selectedFile) => {
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setError('File harus berformat .csv');
            return;
        }

        setFile(selectedFile);
        setError(null);

        try {
            const text = await selectedFile.text();
            const result = parseCSV(text);

            if (result.errors.length > 0) {
                setError(`Terdapat ${result.errors.length} error. Periksa format CSV.`);
            }

            setParsedData(result);
        } catch (err) {
            setError('Gagal membaca file CSV: ' + err.message);
        }
    };

    const handleImport = () => {
        if (!parsedData || parsedData.questions.length === 0) {
            setError('Tidak ada soal valid untuk diimport');
            return;
        }

        setImporting(true);

        // Slight delay for UX
        setTimeout(() => {
            onImport(parsedData.questions);
            setImporting(false);
        }, 500);
    };

    const downloadTemplate = () => {
        const template = `pertanyaan_indo,pertanyaan_arab,pilihan_a,pilihan_b,pilihan_c,jawaban_benar
"Apa arti 'Kaifa haluk'?","كَيْفَ حَالُكَ؟","Apa kabar?","Siapa kamu?","Dari mana?","A"
"Apa arti 'Syukran'?","شُكْرًا","Terima kasih","Maaf","Tolong","A"`;

        const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'template_soal_quiz.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Download Template */}
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                    <p className="font-medium text-slate-200">Template CSV</p>
                    <p className="text-sm text-slate-500">Download template untuk format yang benar</p>
                </div>
                <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                </button>
            </div>

            {/* Drop Zone */}
            <div
                className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                />

                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-lg font-medium text-slate-300 mb-2">
                    Drag & drop file CSV di sini
                </p>
                <p className="text-slate-500">atau klik untuk memilih file</p>

                {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-cyan-400">
                        <FileText className="w-4 h-4" />
                        <span>{file.name}</span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-rose-950/30 border border-rose-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-rose-300 font-medium">Error</p>
                        <p className="text-rose-400/80 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {parsedData && parsedData.questions.length > 0 && (
                <div className="glass-card p-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-cyan-400">
                            Preview ({parsedData.questions.length} soal)
                        </h4>
                        {parsedData.errors.length > 0 && (
                            <span className="text-rose-400 text-sm">
                                {parsedData.errors.length} baris error
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="data-table text-sm">
                            <thead className="sticky top-0">
                                <tr>
                                    <th>#</th>
                                    <th>Pertanyaan Indo</th>
                                    <th>Arab</th>
                                    <th>Jawaban</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.questions.slice(0, 10).map((q, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td className="max-w-[200px] truncate">{q.indonesian}</td>
                                        <td className="font-arabic text-amber-300">{q.arabic}</td>
                                        <td>{['A', 'B', 'C'][q.correctAnswer]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.questions.length > 10 && (
                            <p className="text-slate-500 text-sm text-center mt-2">
                                +{parsedData.questions.length - 10} soal lainnya...
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleImport}
                    disabled={!parsedData || parsedData.questions.length === 0 || importing}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {importing ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Mengimport...
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4" />
                            Import {parsedData?.questions.length || 0} Soal
                        </>
                    )}
                </button>
                {onCancel && (
                    <button onClick={onCancel} className="btn-secondary">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
