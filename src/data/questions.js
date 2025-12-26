// Sample Arabic Quiz Questions
// Format for CSV import: pertanyaan_indo,pertanyaan_arab,pilihan_a,pilihan_b,pilihan_c,jawaban_benar

export const sampleQuestions = [
    {
        id: 1,
        arabic: "كَيْفَ حَالُكَ؟",
        indonesian: "Apa arti 'Kaifa haluk'?",
        options: ["Apa kabar?", "Siapa namamu?", "Dari mana?"],
        correctAnswer: 0,
        timer: 15
    },
    {
        id: 2,
        arabic: "مَا اسْمُكَ؟",
        indonesian: "Apa arti 'Ma ismuk'?",
        options: ["Apa kabar?", "Siapa namamu?", "Di mana rumahmu?"],
        correctAnswer: 1,
        timer: 15
    },
    {
        id: 3,
        arabic: "أَيْنَ تَسْكُنُ؟",
        indonesian: "Apa arti 'Aina taskun'?",
        options: ["Mau kemana?", "Kapan datang?", "Di mana kamu tinggal?"],
        correctAnswer: 2,
        timer: 15
    },
    {
        id: 4,
        arabic: "شُكْرًا",
        indonesian: "Apa arti 'Syukran'?",
        options: ["Terima kasih", "Maaf", "Tolong"],
        correctAnswer: 0,
        timer: 15
    },
    {
        id: 5,
        arabic: "السَّلَامُ عَلَيْكُمْ",
        indonesian: "Apa arti 'Assalamualaikum'?",
        options: ["Selamat pagi", "Semoga keselamatan atasmu", "Selamat tidur"],
        correctAnswer: 1,
        timer: 15
    },
    {
        id: 6,
        arabic: "أَنَا طَالِبٌ",
        indonesian: "Apa arti 'Ana tholib'?",
        options: ["Saya guru", "Saya pelajar", "Saya dokter"],
        correctAnswer: 1,
        timer: 15
    },
    {
        id: 7,
        arabic: "هَذَا كِتَابٌ",
        indonesian: "Apa arti 'Hadza kitab'?",
        options: ["Ini buku", "Itu meja", "Ini pena"],
        correctAnswer: 0,
        timer: 15
    },
    {
        id: 8,
        arabic: "أَحِبُّكَ فِي اللهِ",
        indonesian: "Apa arti 'Uhibbuka fillah'?",
        options: ["Aku benci kamu", "Aku cinta kamu karena Allah", "Aku rindu kamu"],
        correctAnswer: 1,
        timer: 15
    },
    {
        id: 9,
        arabic: "بَارَكَ اللهُ فِيكَ",
        indonesian: "Apa arti 'Barakallahu fiik'?",
        options: ["Semoga Allah memberkahimu", "Semoga Allah memaafkanmu", "Semoga Allah melindungimu"],
        correctAnswer: 0,
        timer: 15
    },
    {
        id: 10,
        arabic: "مَاشَاءَ اللهُ",
        indonesian: "Kapan kita mengucapkan 'Masyaa Allah'?",
        options: ["Saat bersin", "Saat kagum/takjub", "Saat sedih"],
        correctAnswer: 1,
        timer: 15
    }
];

// Gift values in coins (TikTok gift -> coin conversion)
export const giftValues = {
    'Rose': 1,
    'TikTok': 1,
    'GG': 1,
    'Ice Cream Cone': 1,
    'Heart': 5,
    'Finger Heart': 5,
    'Love you': 15,
    'Doughnut': 30,
    'Cap': 99,
    'Hand Hearts': 100,
    'Perfume': 200,
    'Garland': 500,
    'Marvelous Confetti': 1000,
    'Galaxy': 1000,
    'Interstellar': 10000,
    'Lion': 29999
};
