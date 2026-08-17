import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const newQuestions = [
  { text: 'Quem foi o primeiro homem?', options: '["Adão", "Caim", "Noé", "Davi"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a primeira mulher?', options: '["Eva", "Sara", "Rute", "Ester"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem construiu a arca?', options: '["Noé", "Moisés", "Ló", "Abraão"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi chamado de amigo de Deus?', options: '["Abraão", "Isaque", "Jacó", "Jó"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem era o filho da promessa de Abraão e Sara?', options: '["Isaque", "Ismael", "Esaú", "Jacó"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem teve o nome mudado para Israel?', options: '["Jacó", "Isaque", "José", "Rúben"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi vendido como escravo pelos irmãos e se tornou governador do Egito?', options: '["José", "Benjamim", "Levi", "Judá"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem liderou os israelitas na saída do Egito?', options: '["Moisés", "Arão", "Josué", "Calebe"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o irmão de Moisés e primeiro sumo sacerdote?', options: '["Arão", "Hur", "Miriã", "Jetro"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem liderou o povo na conquista da Terra Prometida?', options: '["Josué", "Moisés", "Gideão", "Sansão"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o homem mais forte, cuja força vinha do cabelo?', options: '["Sansão", "Davi", "Golias", "Saul"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a moabita que se tornou ancestral de Jesus?', options: '["Rute", "Noemi", "Raabe", "Bate-Seba"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem ouviu Deus chamando seu nome três vezes quando era menino?', options: '["Samuel", "Davi", "Eli", "Natã"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o primeiro rei de Israel?', options: '["Saul", "Davi", "Salomão", "Jeroboão"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o pastorzinho que derrotou o gigante Golias?', options: '["Davi", "Jônatas", "Abner", "Joabe"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o rei conhecido por sua extraordinária sabedoria?', options: '["Salomão", "Davi", "Ezequias", "Josias"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o profeta que foi arrebatado num carro de fogo?', options: '["Elias", "Eliseu", "Isaías", "Jeremias"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem sucedeu Elias e recebeu porção dupla de seu espírito?', options: '["Eliseu", "Micaías", "Obadias", "Oséias"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem sobreviveu na cova dos leões?', options: '["Daniel", "Sadraque", "Mesaque", "Abednego"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi engolido por um grande peixe após tentar fugir de Deus?', options: '["Jonas", "Naum", "Miqueias", "Amós"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a rainha judia que salvou seu povo do extermínio?', options: '["Ester", "Vasti", "Rute", "Débora"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem perdeu tudo, mas manteve sua integridade a Deus?', options: '["Jó", "Davi", "Abraão", "Daniel"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual profeta reconstruiu os muros de Jerusalém?', options: '["Neemias", "Esdras", "Zorobabel", "Ageu"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem batizou Jesus no rio Jordão?', options: '["João Batista", "Pedro", "Tiago", "André"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi a mãe de Jesus?', options: '["Maria", "Isabel", "Marta", "Maria Madalena"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o marido de Maria, mãe de Jesus?', options: '["José", "Zacarias", "João", "Pedro"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual apóstolo negou Jesus três vezes?', options: '["Pedro", "João", "Judas", "Tomé"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual apóstolo traiu Jesus por 30 moedas de prata?', options: '["Judas Iscariotes", "Tomé", "Filipe", "Mateus"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem duvidou da ressurreição de Jesus até tocar nele?', options: '["Tomé", "Pedro", "João", "Tiago"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem era o cobrador de impostos que se tornou apóstolo?', options: '["Mateus", "Lucas", "Marcos", "Paulo"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem teve uma visão na estrada de Damasco e se tornou o apóstolo dos gentios?', options: '["Paulo", "Pedro", "Estêvão", "Barnabé"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o primeiro mártir cristão, apedrejado por sua fé?', options: '["Estêvão", "Tiago", "Pedro", "Paulo"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual evangelista era médico acompanhante de Paulo?', options: '["Lucas", "Marcos", "João", "Mateus"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual o último livro da Bíblia, escrito pelo apóstolo João?', options: '["Apocalipse", "Atos", "Hebreus", "Judas"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos livros tem a Bíblia inteira?', options: '["66", "39", "27", "73"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Como é conhecido o lugar onde Jesus e os apóstolos tomaram a última ceia?', options: '["Aposento de andar superior", "Templo", "Sinagoga", "Getsêmani"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Em qual jardim Jesus foi preso?', options: '["Getsêmani", "Éden", "Carmelo", "Sião"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o procurador romano que lavou as mãos no julgamento de Jesus?', options: '["Pôncio Pilatos", "Herodes", "César Augusto", "Félix"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos dias Jesus jejuou no deserto?', options: '["40", "30", "7", "12"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual é a principal qualidade de Jeová descrita em 1 João 4:8?', options: '["Amor", "Justiça", "Poder", "Sabedoria"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem escreveu a maior parte dos Salmos?', options: '["Davi", "Salomão", "Asafe", "Moisés"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Que animal falou com Balaão?', options: '["Jumenta", "Ovelha", "Camelo", "Cavalo"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual instrumento Davi tocava para acalmar o rei Saul?', options: '["Harpa", "Flauta", "Trombeta", "Tamborim"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quantos pragas Deus enviou sobre o Egito?', options: '["10", "7", "12", "40"]', correctIndex: 0, timeLimit: 20 },
  { text: 'O que os israelitas comeram no deserto durante 40 anos?', options: '["Maná", "Pão sem fermento", "Codornizes", "Frutos silvestres"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem derribou as muralhas de Jericó?', options: '["Josué", "Moisés", "Gideão", "Sansão"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Qual monte Moisés subiu para receber os Dez Mandamentos?', options: '["Sinai", "Carmelo", "Sião", "Ararat"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Em qual monte a Arca de Noé pousou?', options: '["Ararat", "Sinai", "Moriá", "Nebo"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Onde Jesus nasceu?', options: '["Belém", "Nazaré", "Jerusalém", "Cafarnaum"]', correctIndex: 0, timeLimit: 20 },
  { text: 'Quem foi o jovem ajudante de Paulo a quem ele escreveu duas cartas?', options: '["Timóteo", "Tito", "Filemom", "Apolo"]', correctIndex: 0, timeLimit: 20 }
];

async function main() {
  const quizzes = await prisma.quiz.findMany();
  let targetQuiz = quizzes.find(q => q.title === 'Quiz do Samuca');
  
  if (!targetQuiz) {
    console.log('Quiz do Samuca não encontrado, criando um novo!');
    targetQuiz = await prisma.quiz.create({
      data: {
        title: 'Quiz do Samuca',
        description: 'Quiz Bíblico com 50 questões.'
      }
    });
  } else {
    console.log(`Encontrado Quiz do Samuca com ID: ${targetQuiz.id}`);
  }

  // Deletar questões antigas do Quiz para substituir pelas 50
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

  console.log(`Sucesso! 50 questões foram injetadas no Quiz do Samuca (ID: ${targetQuiz.id}).`);
}

main().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});
