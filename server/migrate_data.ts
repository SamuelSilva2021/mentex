import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const quiz1Questions = [
  { text: 'Quem foi o primeiro homem?', options: ["Adão", "Noé", "Davi", "Caim"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a primeira mulher?', options: ["Eva", "Rute", "Ester", "Sara"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem construiu a arca?', options: ["Abraão", "Noé", "Moisés", "Ló"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi chamado de amigo de Deus?', options: ["Jó", "Isaque", "Abraão", "Jacó"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem era o filho da promessa de Abraão e Sara?', options: ["Jacó", "Ismael", "Isaque", "Esaú"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem teve o nome mudado para Israel?', options: ["Isaque", "José", "Jacó", "Rúben"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi vendido como escravo pelos irmãos e se tornou governador do Egito?', options: ["Judá", "Levi", "Benjamim", "José"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem liderou os israelitas na saída do Egito?', options: ["Calebe", "Arão", "Josué", "Moisés"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi o irmão de Moisés e primeiro sumo sacerdote?', options: ["Jetro", "Miriã", "Arão", "Hur"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem liderou o povo na conquista da Terra Prometida?', options: ["Gideão", "Sansão", "Moisés", "Josué"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi o homem mais forte, cuja força vinha do cabelo?', options: ["Golias", "Saul", "Davi", "Sansão"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi a moabita que se tornou ancestral de Jesus?', options: ["Raabe", "Noemi", "Rute", "Bate-Seba"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem ouviu Deus chamando seu nome três vezes quando era menino?', options: ["Eli", "Samuel", "Natã", "Davi"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o primeiro rei de Israel?', options: ["Jeroboão", "Davi", "Saul", "Salomão"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi o pastorzinho que derrotou o gigante Golias?', options: ["Jônatas", "Abner", "Joabe", "Davi"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi o rei conhecido por sua extraordinária sabedoria?', options: ["Josias", "Ezequias", "Davi", "Salomão"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi o profeta que foi arrebatado num carro de fogo?', options: ["Isaías", "Jeremias", "Eliseu", "Elias"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem sucedeu Elias e recebeu porção dupla de seu espírito?', options: ["Oséias", "Micaías", "Obadias", "Eliseu"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem sobreviveu na cova dos leões?', options: ["Abednego", "Mesaque", "Sadraque", "Daniel"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi engolido por um grande peixe após tentar fugir de Deus?', options: ["Amós", "Miqueias", "Naum", "Jonas"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem foi a rainha judia que salvou seu povo do extermínio?', options: ["Débora", "Rute", "Ester", "Vasti"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem perdeu tudo, mas manteve sua integridade a Deus?', options: ["Davi", "Jó", "Daniel", "Abraão"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual profeta reconstruiu os muros de Jerusalém?', options: ["Ageu", "Esdras", "Zorobabel", "Neemias"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem batizou Jesus no rio Jordão?', options: ["João Batista", "André", "Tiago", "Pedro"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a mãe de Jesus?', options: ["Marta", "Maria", "Isabel", "Maria Madalena"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o marido de Maria, mãe de Jesus?', options: ["José", "Pedro", "Zacarias", "João"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual apóstolo negou Jesus três vezes?', options: ["João", "Pedro", "Tomé", "Judas"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual apóstolo traiu Jesus por 30 moedas de prata?', options: ["Tomé", "Filipe", "Mateus", "Judas Iscariotes"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem duvidou da ressurreição de Jesus até tocar nele?', options: ["Pedro", "Tomé", "Tiago", "João"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem era o cobrador de impostos que se tornou apóstolo?', options: ["Lucas", "Marcos", "Paulo", "Mateus"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem teve uma visão na estrada de Damasco e se tornou o apóstolo dos gentios?', options: ["Barnabé", "Paulo", "Pedro", "Estêvão"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o primeiro mártir cristão, apedrejado por sua fé?', options: ["Pedro", "Paulo", "Estêvão", "Tiago"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual evangelista era médico acompanhante de Paulo?', options: ["João", "Marcos", "Mateus", "Lucas"], correctIndex: 3, timeLimit: 20 },
  { text: 'Qual o último livro da Bíblia, escrito pelo apóstolo João?', options: ["Atos", "Hebreus", "Apocalipse", "Judas"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos livros tem a Bíblia inteira?', options: ["66", "27", "39", "73"], correctIndex: 0, timeLimit: 20 },
  { text: 'Como é conhecido o lugar onde Jesus e os apóstolos tomaram a última ceia?', options: ["Getsêmani", "Templo", "Sinagoga", "Aposento de andar superior"], correctIndex: 3, timeLimit: 20 },
  { text: 'Em qual jardim Jesus foi preso?', options: ["Sião", "Getsêmani", "Carmelo", "Éden"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o procurador romano que lavou as mãos no julgamento de Jesus?', options: ["César Augusto", "Herodes", "Félix", "Pôncio Pilatos"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quantos dias Jesus jejuou no deserto?', options: ["30", "12", "40", "7"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual é o maior mandamento segundo Jesus?', options: ["Dar o dízimo", "Amar a Deus de todo coração", "Guardar o sábado", "Não mentir"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual é a principal qualidade de Jeová descrita em 1 João 4:8?', options: ["Justiça", "Amor", "Sabedoria", "Poder"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual o nome do rio onde os israelitas cruzaram para entrar em Canaã?', options: ["Rio Jordão", "Rio Tigre", "Rio Eufrates", "Rio Nilo"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a esposa de Isaque?', options: ["Rebeca", "Sara", "Lia", "Raquel"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem era o rei da Babilônia quando Daniel foi levado cativo?', options: ["Dario", "Belsazar", "Nabucodonosor", "Ciro"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi o jovem ajudante de Paulo a quem ele escreveu duas cartas?', options: ["Filemom", "Timóteo", "Tito", "Apolo"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos dias e noites choveu no Dilúvio?', options: ["7 dias e 7 noites", "100 dias", "150 dias", "40 dias e 40 noites"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quem subiu numa figueira brava para ver Jesus passar?', options: ["Zaqueu", "Lázaro", "Nicodemos", "Bartimeu"], correctIndex: 0, timeLimit: 20 },
  { text: 'Em qual cidade Jesus realizou seu primeiro milagre?', options: ["Belém", "Nazaré", "Cafarnaum", "Caná da Galileia"], correctIndex: 3, timeLimit: 20 },
  { text: 'Qual o nome do discípulo que foi ressuscitado por Jesus após 4 dias?', options: ["Estêvão", "Jairo", "Eutíquio", "Lázaro"], correctIndex: 3, timeLimit: 20 },
  { text: 'Quantas pragas caíram sobre o Egito?', options: ["12", "40", "10", "7"], correctIndex: 2, timeLimit: 20 }
];

const quiz2Questions = [
  { text: 'Quantos dias e noites choveu durante o Dilúvio nos dias de Noé?', options: ["7 dias e 7 noites", "40 dias e 40 noites", "150 dias e 150 noites", "365 dias"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da esposa de Abraão antes de Deus mudar seu nome?', options: ["Rebeca", "Sara", "Sarai", "Raquel"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos anos Noé tinha quando o Dilúvio começou?', options: ["500 anos", "600 anos", "120 anos", "950 anos"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual foi o primeiro milagre que Jesus realizou segundo o evangelho de João?', options: ["Curou um cego", "Transformou água em vinho", "Multiplicou pães e peixes", "Ressuscitou Lázaro"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o sucessor de Moisés como líder de Israel?', options: ["Calebe", "Arão", "Josué", "Samuel"], correctIndex: 2, timeLimit: 20 },
  { text: 'Em qual cidade Jesus nasceu?', options: ["Nazaré", "Jerusalém", "Belém", "Capernaum"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos livros compõem a Bíblia completa usada pelas Testemunhas de Jeová?', options: ["39", "66", "73", "27"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome original de Abraão?', options: ["Jacó", "Abrão", "Isaque", "Terá"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o irmão mais novo de José, filho de Jacó?', options: ["Rúben", "Simeão", "Benjamim", "Judá"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos dias Jesus jejuou no deserto antes de ser tentado?', options: ["7 dias", "20 dias", "40 dias", "50 dias"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era a profissão de Pedro antes de seguir Jesus?', options: ["Carpinteiro", "Cobrador de impostos", "Pescador", "Pastor de ovelhas"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem interpretou o sonho de Nabucodonosor sobre a grande estátua?', options: ["José", "Daniel", "Ezequiel", "Jeremias"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual foi o primeiro rei de Israel?', options: ["Davi", "Saul", "Salomão", "Samuel"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos anos os israelitas vagaram no deserto após saírem do Egito?', options: ["20 anos", "30 anos", "40 anos", "50 anos"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem construiu o primeiro templo em Jerusalém?', options: ["Davi", "Salomão", "Esdras", "Neemias"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da mãe de João Batista?', options: ["Maria", "Isabel", "Ana", "Marta"], correctIndex: 1, timeLimit: 20 },
  { text: 'Em qual rio Jesus foi batizado?', options: ["Nilo", "Eufrates", "Jordão", "Tigre"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos leprosos Jesus curou de uma vez, segundo Lucas 17?', options: ["5", "7", "10", "12"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi lançado na cova dos leões?', options: ["José", "Daniel", "Jeremias", "Paulo"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do gigante que Davi derrotou?', options: ["Golias", "Sansão", "Ogue", "Anak"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos discípulos Jesus escolheu como apóstolos?', options: ["7", "10", "12", "70"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem escreveu a maior parte das cartas do Novo Testamento?', options: ["Pedro", "João", "Paulo", "Tiago"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era o nome do pai de João Batista?', options: ["José", "Zacarias", "Simeão", "Eli"], correctIndex: 1, timeLimit: 20 },
  { text: 'Em quantos dias Deus criou os céus e a terra, segundo Gênesis?', options: ["3 dias", "6 dias", "7 dias", "10 dias"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi a primeira mulher mencionada na Bíblia?', options: ["Sara", "Eva", "Rebeca", "Raquel"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do irmão de Moisés que falava por ele?', options: ["Josué", "Arão", "Calebe", "Hur"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos anos Matusalém viveu?', options: ["777 anos", "900 anos", "969 anos", "1000 anos"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem traiu Jesus por 30 moedas de prata?', options: ["Pedro", "Judas Iscariotes", "Tomé", "João"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da cidade onde Jesus cresceu?', options: ["Belém", "Jerusalém", "Nazaré", "Cafarnaum"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quem foi engolido por um grande peixe?', options: ["Noé", "Jonas", "Moisés", "Elias"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos filhos Jacó teve no total?', options: ["10", "11", "12", "13"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era o nome da esposa de Isaque?', options: ["Sara", "Rebeca", "Raquel", "Lia"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o último juiz de Israel antes dos reis?', options: ["Sansão", "Gideão", "Samuel", "Débora"], correctIndex: 2, timeLimit: 20 },
  { text: 'Em qual monte Moisés recebeu os Dez Mandamentos?', options: ["Monte das Oliveiras", "Monte Sinai", "Monte Carmelo", "Monte Sião"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o rei que pediu sabedoria a Deus em vez de riquezas?', options: ["Saul", "Davi", "Salomão", "Ezequias"], correctIndex: 2, timeLimit: 20 },
  { text: 'Quantos dias Lázaro estava morto quando Jesus o ressuscitou?', options: ["1 dia", "2 dias", "3 dias", "4 dias"], correctIndex: 3, timeLimit: 20 },
  { text: 'Qual era o nome da irmã de Moisés?', options: ["Miriã", "Débora", "Rute", "Ester"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem escreveu o livro de Apocalipse?', options: ["Pedro", "Paulo", "João", "Tiago"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era a idade aproximada de Jesus quando começou seu ministério?', options: ["25 anos", "30 anos", "33 anos", "40 anos"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o pai de Davi?', options: ["Saul", "Jessé", "Samuel", "Abner"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quantas pragas Deus enviou sobre o Egito?', options: ["7", "10", "12", "15"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do rei que tentou matar o menino Jesus?', options: ["Pilatos", "Herodes", "César", "Caifás"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi a mulher que escondeu os espias israelitas em Jericó?', options: ["Rute", "Raabe", "Ester", "Débora"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome do anjo que anunciou o nascimento de Jesus a Maria?', options: ["Miguel", "Gabriel", "Rafael", "Uriel"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quantos anos Davi reinou como rei de Israel?', options: ["30 anos", "40 anos", "50 anos", "60 anos"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o profeta que desafiou os profetas de Baal no Monte Carmelo?', options: ["Eliseu", "Elias", "Isaías", "Jeremias"], correctIndex: 1, timeLimit: 20 },
  { text: 'Qual era o nome da esposa de Zacarias e mãe de João Batista?', options: ["Maria", "Isabel", "Ana", "Marta"], correctIndex: 1, timeLimit: 20 },
  { text: 'Em qual livro da Bíblia está o relato da criação?', options: ["Êxodo", "Gênesis", "Levítico", "Números"], correctIndex: 1, timeLimit: 20 },
  { text: 'Quem foi o discípulo que duvidou da ressurreição de Jesus até ver as marcas?', options: ["Pedro", "João", "Tomé", "André"], correctIndex: 2, timeLimit: 20 },
  { text: 'Qual era o nome do lugar onde Jesus foi crucificado?', options: ["Getsêmani", "Gólgota", "Betânia", "Emaús"], correctIndex: 1, timeLimit: 20 }
];

async function migrate() {
  console.log('--- Iniciando Migração para o Neon PostgreSQL ---');

  // Limpa registros anteriores se houver (para garantir idempotência)
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});

  // 1. Cria Quiz 1: Quiz do Samuca
  console.log('Inserindo "Quiz do Samuca" com 50 questões...');
  const q1 = await prisma.quiz.create({
    data: {
      title: 'Quiz do Samuca',
      description: 'Quiz Bíblico com 50 questões',
      questions: {
        create: quiz1Questions.map(q => ({
          text: q.text,
          options: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          timeLimit: q.timeLimit
        }))
      }
    },
    include: { questions: true }
  });
  console.log(`✓ "Quiz do Samuca" criado com ID: ${q1.id} e ${q1.questions.length} questões.`);

  // 2. Cria Quiz 2: JW - Nível 2
  console.log('Inserindo "JW - Nível 2" com 50 questões...');
  const q2 = await prisma.quiz.create({
    data: {
      title: 'JW - Nível 2',
      description: 'Quiz Bíblico Nível 2 com 50 questões mais detalhadas.',
      questions: {
        create: quiz2Questions.map(q => ({
          text: q.text,
          options: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          timeLimit: q.timeLimit
        }))
      }
    },
    include: { questions: true }
  });
  console.log(`✓ "JW - Nível 2" criado com ID: ${q2.id} e ${q2.questions.length} questões.`);

  // Verificação final
  const allQuizzes = await prisma.quiz.findMany({ include: { questions: true } });
  console.log('\n--- VERIFICAÇÃO FINAL NO NEON POSTGRESQL ---');
  allQuizzes.forEach(quiz => {
    console.log(`- [ID: ${quiz.id}] ${quiz.title} (${quiz.questions.length} perguntas) | Descrição: "${quiz.description}"`);
  });
  console.log('--------------------------------------------');
}

migrate()
  .catch(console.error)
  .finally(() => pool.end());
