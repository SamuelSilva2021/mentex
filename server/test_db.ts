import Database from 'better-sqlite3';
const db = new Database('./prisma/dev.db');
const quizzes = db.prepare('SELECT id, title FROM Quiz').all();
console.log(quizzes);
