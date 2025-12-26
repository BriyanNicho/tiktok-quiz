import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'quiz.db'));

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS global_state (
        key TEXT PRIMARY KEY,
        value TEXT
    );

    CREATE TABLE IF NOT EXISTS pintar_scores (
        uniqueId TEXT PRIMARY KEY,
        nickname TEXT,
        score INTEGER DEFAULT 0,
        avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS sultan_scores (
        uniqueId TEXT PRIMARY KEY,
        nickname TEXT,
        score INTEGER DEFAULT 0,
        avatar TEXT
    );
`);

// Helper to get state
export function getState(key, defaultValue = null) {
    const row = db.prepare('SELECT value FROM global_state WHERE key = ?').get(key);
    return row ? JSON.parse(row.value) : defaultValue;
}

// Helper to set state
export function setState(key, value) {
    db.prepare('INSERT OR REPLACE INTO global_state (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
}

// Scores API
export function updatePintarScore(uniqueId, nickname, addScore) {
    const row = db.prepare('SELECT score FROM pintar_scores WHERE uniqueId = ?').get(uniqueId);
    const newScore = (row ? row.score : 0) + addScore;
    db.prepare('INSERT OR REPLACE INTO pintar_scores (uniqueId, nickname, score) VALUES (?, ?, ?)').run(uniqueId, nickname, newScore);
    return newScore;
}

export function updateSultanScore(uniqueId, nickname, addScore) {
    const row = db.prepare('SELECT score FROM sultan_scores WHERE uniqueId = ?').get(uniqueId);
    const newScore = (row ? row.score : 0) + addScore;
    db.prepare('INSERT OR REPLACE INTO sultan_scores (uniqueId, nickname, score) VALUES (?, ?, ?)').run(uniqueId, nickname, newScore);
    return newScore;
}

export function getPintarScores() {
    return db.prepare('SELECT * FROM pintar_scores ORDER BY score DESC').all();
}

export function getSultanScores() {
    return db.prepare('SELECT * FROM sultan_scores ORDER BY score DESC').all();
}

export function resetScores() {
    db.prepare('DELETE FROM pintar_scores').run();
    db.prepare('DELETE FROM sultan_scores').run();
}
