/**
 * CSV Parser Utility for Quiz Questions
 * Expected format: pertanyaan_indo,pertanyaan_arab,pilihan_a,pilihan_b,pilihan_c,jawaban_benar
 */

export function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    const questions = [];
    const errors = [];

    if (lines.length < 2) {
        errors.push({ row: 0, message: 'File CSV harus memiliki header dan minimal 1 baris data' });
        return { questions, errors };
    }

    // Parse header
    const header = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    // Expected columns
    const expectedColumns = [
        'pertanyaan_indo',
        'pertanyaan_arab',
        'pilihan_a',
        'pilihan_b',
        'pilihan_c',
        'jawaban_benar'
    ];

    // Validate header
    const missingColumns = expectedColumns.filter(col => !header.includes(col));
    if (missingColumns.length > 0) {
        errors.push({
            row: 0,
            message: `Kolom tidak ditemukan: ${missingColumns.join(', ')}`
        });
        return { questions, errors };
    }

    // Get column indices
    const colIndex = {};
    expectedColumns.forEach(col => {
        colIndex[col] = header.indexOf(col);
    });

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = parseCSVLine(lines[i]);

            if (values.length < expectedColumns.length) {
                errors.push({
                    row: i + 1,
                    message: `Baris ${i + 1}: Jumlah kolom tidak sesuai`
                });
                continue;
            }

            const indonesian = values[colIndex['pertanyaan_indo']]?.trim();
            const arabic = values[colIndex['pertanyaan_arab']]?.trim();
            const optionA = values[colIndex['pilihan_a']]?.trim();
            const optionB = values[colIndex['pilihan_b']]?.trim();
            const optionC = values[colIndex['pilihan_c']]?.trim();
            const correctAnswerRaw = values[colIndex['jawaban_benar']]?.trim().toUpperCase();

            // Validate required fields
            if (!indonesian || !arabic) {
                errors.push({
                    row: i + 1,
                    message: `Baris ${i + 1}: Pertanyaan Indo/Arab tidak boleh kosong`
                });
                continue;
            }

            if (!optionA || !optionB || !optionC) {
                errors.push({
                    row: i + 1,
                    message: `Baris ${i + 1}: Semua pilihan jawaban harus diisi`
                });
                continue;
            }

            // Parse correct answer
            let correctAnswer;
            if (correctAnswerRaw === 'A' || correctAnswerRaw === '0') {
                correctAnswer = 0;
            } else if (correctAnswerRaw === 'B' || correctAnswerRaw === '1') {
                correctAnswer = 1;
            } else if (correctAnswerRaw === 'C' || correctAnswerRaw === '2') {
                correctAnswer = 2;
            } else {
                errors.push({
                    row: i + 1,
                    message: `Baris ${i + 1}: Jawaban benar harus A, B, atau C`
                });
                continue;
            }

            questions.push({
                id: Date.now() + i,
                indonesian,
                arabic,
                options: [optionA, optionB, optionC],
                correctAnswer,
                timer: 15
            });

        } catch (err) {
            errors.push({
                row: i + 1,
                message: `Baris ${i + 1}: ${err.message}`
            });
        }
    }

    return { questions, errors };
}

/**
 * Parse a single CSV line handling quoted strings
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

/**
 * Export questions to CSV format
 */
export function exportToCSV(questions) {
    const header = 'pertanyaan_indo,pertanyaan_arab,pilihan_a,pilihan_b,pilihan_c,jawaban_benar';

    const rows = questions.map(q => {
        const escape = (str) => `"${(str || '').replace(/"/g, '""')}"`;
        const answer = ['A', 'B', 'C'][q.correctAnswer];

        return [
            escape(q.indonesian),
            escape(q.arabic),
            escape(q.options[0]),
            escape(q.options[1]),
            escape(q.options[2]),
            escape(answer)
        ].join(',');
    });

    return [header, ...rows].join('\n');
}
