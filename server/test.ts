import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

console.log('URL:', process.env.DATABASE_URL);
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const quizzes = await prisma.quiz.findMany();
  console.log('Quizzes:', quizzes);
}

main().catch(console.error).finally(() => prisma.$disconnect());
