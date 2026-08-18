import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const newQuestions = [
  { text: 'Quantos dias e noites choveu durante o Dilúvio nos dias de Noé?', options: '["7 dias e 7 noites", "40 dias e 40 noites", "150 dias e 150 noites", "365 dias"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da esposa de Abraão antes de Deus mudar seu nome?', options: '["Rebeca", "Sara", "Sarai", "Raquel"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos anos Noé tinha quando o Dilúvio começou?', options: '["500 anos", "600 anos", "120 anos", "950 anos"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual foi o primeiro milagre que Jesus realizou segundo o evangelho de João?', options: '["Curou um cego", "Transformou água em vinho", "Multiplicou pães e peixes", "Ressuscitou Lázaro"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o sucessor de Moisés como líder de Israel?', options: '["Calebe", "Arão", "Josué", "Samuel"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Em qual cidade Jesus nasceu?', options: '["Nazaré", "Jerusalém", "Belém", "Capernaum"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos livros compõem a Bíblia completa usada pelas Testemunhas de Jeová?', options: '["39", "66", "73", "27"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome original de Abraão?', options: '["Jacó", "Abrão", "Isaque", "Terá"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o irmão mais novo de José, filho de Jacó?', options: '["Rúben", "Simeão", "Benjamim", "Judá"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos dias Jesus jejuou no deserto antes de ser tentado?', options: '["7 dias", "20 dias", "40 dias", "50 dias"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era a profissão de Pedro antes de seguir Jesus?', options: '["Carpinteiro", "Cobrador de impostos", "Pescador", "Pastor de ovelhas"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quem interpretou o sonho de Nabucodonosor sobre a grande estátua?', options: '["José", "Daniel", "Ezequiel", "Jeremias"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual foi o primeiro rei de Israel?', options: '["Davi", "Saul", "Salomão", "Samuel"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos anos os israelitas vagaram no deserto após saírem do Egito?', options: '["20 anos", "30 anos", "40 anos", "50 anos"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quem construiu o primeiro templo em Jerusalém?', options: '["Davi", "Salomão", "Esdras", "Neemias"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da mãe de João Batista?', options: '["Maria", "Isabel", "Ana", "Marta"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Em qual rio Jesus foi batizado?', options: '["Nilo", "Eufrates", "Jordão", "Tigre"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos leprosos Jesus curou de uma vez, segundo Lucas 17?', options: '["5", "7", "10", "12"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi lançado na cova dos leões?', options: '["José", "Daniel", "Jeremias", "Paulo"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do gigante que Davi derrotou?', options: '["Golias", "Sansão", "Ogue", "Anak"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos discípulos Jesus escolheu como apóstolos?', options: '["7", "10", "12", "70"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quem escreveu a maior parte das cartas do Novo Testamento?', options: '["Pedro", "João", "Paulo", "Tiago"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era o nome do pai de João Batista?', options: '["José", "Zacarias", "Simeão", "Eli"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Em quantos dias Deus criou os céus e a terra, segundo Gênesis?', options: '["3 dias", "6 dias", "7 dias", "10 dias"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi a primeira mulher mencionada na Bíblia?', options: '["Sara", "Eva", "Rebeca", "Raquel"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do irmão de Moisés que falava por ele?', options: '["Josué", "Arão", "Calebe", "Hur"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos anos Matusalém viveu?', options: '["777 anos", "900 anos", "969 anos", "1000 anos"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quem traiu Jesus por 30 moedas de prata?', options: '["Pedro", "Judas Iscariotes", "Tomé", "João"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da cidade onde Jesus cresceu?', options: '["Belém", "Jerusalém", "Nazaré", "Cafarnaum"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi engolido por um grande peixe?', options: '["Noé", "Jonas", "Moisés", "Elias"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos filhos Jacó teve no total?', options: '["10", "11", "12", "13"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era o nome da esposa de Isaque?', options: '["Sara", "Rebeca", "Raquel", "Lia"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o último juiz de Israel antes dos reis?', options: '["Sansão", "Gideão", "Samuel", "Débora"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Em qual monte Moisés recebeu os Dez Mandamentos?', options: '["Monte das Oliveiras", "Monte Sinai", "Monte Carmelo", "Monte Sião"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o rei que pediu sabedoria a Deus em vez de riquezas?', options: '["Saul", "Davi", "Salomão", "Ezequias"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos dias Lázaro estava morto quando Jesus o ressuscitou?', options: '["1 dia", "2 dias", "3 dias", "4 dias"]', correctIndex: 3, timeLimit: 20 },
  { text: 'Qual era o nome da irmã de Moisés?', options: '["Miriã", "Débora", "Rute", "Ester"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem escreveu o livro de Apocalipse?', options: '["Pedro", "Paulo", "João", "Tiago"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era a idade aproximada de Jesus quando começou seu ministério?', options: '["25 anos", "30 anos", "33 anos", "40 anos"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o pai de Davi?', options: '["Saul", "Jessé", "Samuel", "Abner"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quantas pragas Deus enviou sobre o Egito?', options: '["7", "10", "12", "15"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do rei que tentou matar o menino Jesus?', options: '["Pilatos", "Herodes", "César", "Caifás"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi a mulher que escondeu os espias israelitas em Jericó?', options: '["Rute", "Raabe", "Ester", "Débora"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do anjo que anunciou o nascimento de Jesus a Maria?', options: '["Miguel", "Gabriel", "Rafael", "Uriel"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos anos Davi reinou como rei de Israel?', options: '["30 anos", "40 anos", "50 anos", "60 anos"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o profeta que desafiou os profetas de Baal no Monte Carmelo?', options: '["Eliseu", "Elias", "Isaías", "Jeremias"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da esposa de Zacarias e mãe de João Batista?', options: '["Maria", "Isabel", "Ana", "Marta"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Em qual livro da Bíblia está o relato da criação?', options: '["Êxodo", "Gênesis", "Levítico", "Números"]', correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o discípulo que duvidou da ressurreição de Jesus até ver as marcas?', options: '["Pedro", "João", "Tomé", "André"]', correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era o nome do lugar onde Jesus foi crucificado?', options: '["Getsêmani", "Gólgota", "Betânia", "Emmaús"]', correctIndex: 1, timeLimit: 20 },
];

async function main() {
  const quizTitle = 'JW - Nível 2';

  let targetQuiz = await prisma.quiz.findFirst({
    where: { title: quizTitle }
  });

  if (!targetQuiz) {
    console.log(`"${quizTitle}" não encontrado. Criando...`);
    targetQuiz = await prisma.quiz.create({
      data: {
        title: quizTitle,
        description: 'Quiz Bíblico Nível 2 com 50 questões mais detalhadas.'
      }
    });
  } else {
    console.log(`"${quizTitle}" encontrado com ID: ${targetQuiz.id}`);
  }

  await prisma.question.deleteMany({
    where: { quizId: targetQuiz.id }
  });

  for (const q of newQuestions) {
    await prisma.question.create({
      data: {
        quizId: targetQuiz.id,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        timeLimit: q.timeLimit
      }
    });
  }

  console.log(`Sucesso! ${newQuestions.length} questões foram injetadas no "${quizTitle}" (ID: ${targetQuiz.id}).`);
}

main().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});

