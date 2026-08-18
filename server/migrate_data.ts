import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const quiz1Questions = [
  { text: 'Quem foi o primeiro homem?', options: ["Adão", "Caim", "Noé", "Davi"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a primeira mulher?', options: ["Eva", "Sara", "Rute", "Ester"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem construiu a arca?', options: ["Noé", "Moisés", "Ló", "Abraão"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi chamado de amigo de Deus?', options: ["Abraão", "Isaque", "Jacó", "Jó"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem era o filho da promessa de Abraão e Sara?', options: ["Isaque", "Ismael", "Esaú", "Jacó"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem teve o nome mudado para Israel?', options: ["Jacó", "Isaque", "José", "Rúben"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi vendido como escravo pelos irmãos e se tornou governador do Egito?', options: ["José", "Benjamim", "Levi", "Judá"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem liderou os israelitas na saída do Egito?', options: ["Moisés", "Arão", "Josué", "Calebe"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o irmão de Moisés e primeiro sumo sacerdote?', options: ["Arão", "Hur", "Miriã", "Jetro"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem liderou o povo na conquista da Terra Prometida?', options: ["Josué", "Moisés", "Gideão", "Sansão"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o homem mais forte, cuja força vinha do cabelo?', options: ["Sansão", "Davi", "Golias", "Saul"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a moabita que se tornou ancestral de Jesus?', options: ["Rute", "Noemi", "Raabe", "Bate-Seba"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem ouviu Deus chamando seu nome três vezes quando era menino?', options: ["Samuel", "Davi", "Eli", "Natã"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o primeiro rei de Israel?', options: ["Saul", "Davi", "Salomão", "Jeroboão"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o pastorzinho que derrotou o gigante Golias?', options: ["Davi", "Jônatas", "Abner", "Joabe"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o rei conhecido por sua extraordinária sabedoria?', options: ["Salomão", "Davi", "Ezequias", "Josias"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o profeta que foi arrebatado num carro de fogo?', options: ["Elias", "Eliseu", "Isaías", "Jeremias"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem sucedeu Elias e recebeu porção dupla de seu espírito?', options: ["Eliseu", "Micaías", "Obadias", "Oséias"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem sobreviveu na cova dos leões?', options: ["Daniel", "Sadraque", "Mesaque", "Abednego"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi engolido por um grande peixe após tentar fugir de Deus?', options: ["Jonas", "Naum", "Miqueias", "Amós"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a rainha judia que salvou seu povo do extermínio?', options: ["Ester", "Vasti", "Rute", "Débora"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem perdeu tudo, mas manteve sua integridade a Deus?', options: ["Jó", "Davi", "Abraão", "Daniel"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual profeta reconstruiu os muros de Jerusalém?', options: ["Neemias", "Esdras", "Zorobabel", "Ageu"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem batizou Jesus no rio Jordão?', options: ["João Batista", "Pedro", "Tiago", "André"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a mãe de Jesus?', options: ["Maria", "Isabel", "Marta", "Maria Madalena"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o marido de Maria, mãe de Jesus?', options: ["José", "Zacarias", "João", "Pedro"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual apóstolo negou Jesus três vezes?', options: ["Pedro", "João", "Judas", "Tomé"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual apóstolo traiu Jesus por 30 moedas de prata?', options: ["Judas Iscariotes", "Tomé", "Filipe", "Mateus"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem duvidou da ressurreição de Jesus até tocar nele?', options: ["Tomé", "Pedro", "João", "Tiago"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem era o cobrador de impostos que se tornou apóstolo?', options: ["Mateus", "Lucas", "Marcos", "Paulo"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem teve uma visão na estrada de Damasco e se tornou o apóstolo dos gentios?', options: ["Paulo", "Pedro", "Estêvão", "Barnabé"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o primeiro mártir cristão, apedrejado por sua fé?', options: ["Estêvão", "Tiago", "Pedro", "Paulo"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual evangelista era médico acompanhante de Paulo?', options: ["Lucas", "Marcos", "João", "Mateus"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual o último livro da Bíblia, escrito pelo apóstolo João?', options: ["Apocalipse", "Atos", "Hebreus", "Judas"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos livros tem a Bíblia inteira?', options: ["66", "39", "27", "73"], correctIndex: 0, timeLimit: 20 },
  { text: 'Como é conhecido o lugar onde Jesus e os apóstolos tomaram a última ceia?', options: ["Aposento de andar superior", "Templo", "Sinagoga", "Getsêmani"], correctIndex: 0, timeLimit: 20 },
  { text: 'Em qual jardim Jesus foi preso?', options: ["Getsêmani", "Éden", "Carmelo", "Sião"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o procurador romano que lavou as mãos no julgamento de Jesus?', options: ["Pôncio Pilatos", "Herodes", "César Augusto", "Félix"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos dias Jesus jejuou no deserto?', options: ["40", "30", "7", "12"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual é o maior mandamento segundo Jesus?', options: ["Amar a Deus de todo coração", "Guardar o sábado", "Dar o dízimo", "Não mentir"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual é a principal qualidade de Jeová descrita em 1 João 4:8?', options: ["Amor", "Justiça", "Poder", "Sabedoria"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual o nome do rio onde os israelitas cruzaram para entrar em Canaã?', options: ["Rio Jordão", "Rio Nilo", "Rio Eufrates", "Rio Tigre"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a esposa de Isaque?', options: ["Rebeca", "Raquel", "Lia", "Sara"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem era o rei da Babilônia quando Daniel foi levado cativo?', options: ["Nabucodonosor", "Belsazar", "Dario", "Ciro"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o jovem ajudante de Paulo a quem ele escreveu duas cartas?', options: ["Timóteo", "Tito", "Filemom", "Apolo"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos dias e noites choveu no Dilúvio?', options: ["40 dias e 40 noites", "7 dias e 7 noites", "150 dias", "100 dias"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quem subiu numa figueira brava para ver Jesus passar?', options: ["Zaqueu", "Bartimeu", "Lázaro", "Nicodemos"], correctIndex: 0, timeLimit: 20 },
  { text: 'Em qual cidade Jesus realizou seu primeiro milagre?', options: ["Caná da Galileia", "Nazaré", "Belém", "Cafarnaum"], correctIndex: 0, timeLimit: 20 },
  { text: 'Qual o nome do discípulo que foi ressuscitado por Jesus após 4 dias?', options: ["Lázaro", "Jairo", "Estêvão", "Eutíquio"], correctIndex: 0, timeLimit: 20 },
  { text: 'Quantas pragas caíram sobre o Egito?', options: ["10", "7", "12", "40"], correctIndex: 0, timeLimit: 20 }
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
