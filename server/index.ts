import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { 
  Room, 
  Question, 
  ClientToServerEvents, 
  ServerToClientEvents,
  AnswerInfo 
} from '../shared/types.js';

import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// API Endpoints
app.get('/api/quizzes', async (req, res) => {
  const quizzes = await prisma.quiz.findMany({ include: { questions: true } });
  // parse JSON options
  const formatted = quizzes.map((q: any) => ({
    ...q,
    questions: q.questions.map((quest: any) => ({
      ...quest,
      options: JSON.parse(quest.options)
    }))
  }));
  res.json(formatted);
});

app.post('/api/quizzes', async (req, res) => {
  const { title, description } = req.body;
  const quiz = await prisma.quiz.create({
    data: { title, description }
  });
  res.json(quiz);
});
app.put('/api/quizzes/:id', async (req, res) => {
  const { title, questions } = req.body;
  const quizId = parseInt(req.params.id);

  try {
    await prisma.question.deleteMany({ where: { quizId } });
    
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            timeLimit: q.timeLimit
          }))
        }
      },
      include: { questions: true }
    });

    res.json(updatedQuiz);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*", // allow all in dev
    methods: ["GET", "POST"]
  }
});

// Game state in memory
const rooms: Record<string, Room> = {}; 

function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  console.log('A user connected:', socket.id);

  // HOST creates a room
  socket.on('host:create-room', async ({ quizId }) => {
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true }
      });
      if (!quiz) return socket.emit('error', 'Quiz não encontrado');

      const questions: Question[] = quiz.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        options: JSON.parse(q.options),
        correctIndex: q.correctIndex,
        timeLimit: q.timeLimit
      }));

      let pin: string;
      do {
        pin = generatePIN();
      } while (rooms[pin]);

      rooms[pin] = {
        hostId: socket.id,
        players: [],
        questions: questions,
        currentQuestionIndex: -1,
        state: 'LOBBY',
        answers: {}
      };

      socket.join(pin);
      socket.emit('room-created', { pin });
      console.log(`Room ${pin} created by Host ${socket.id} for Quiz ${quizId}`);
    } catch (e) {
      console.error(e);
    }
  });

  // PLAYER joins a room
  socket.on('player:join', ({ pin, nickname }) => {
    const room = rooms[pin];
    if (!room) {
      return socket.emit('error', 'Sala não encontrada');
    }
    if (room.state !== 'LOBBY') {
      return socket.emit('error', 'O jogo já começou');
    }

    const player = { id: socket.id, nickname, score: 0, streak: 0 };
    room.players.push(player);
    socket.join(pin);
    
    // Notify host and players
    io.to(pin).emit('player-joined', room.players);
    socket.emit('join-success', { pin, nickname });
    console.log(`Player ${nickname} joined room ${pin}`);
  });

  // HOST starts the game
  socket.on('host:start-game', ({ pin }) => {
    const room = rooms[pin];
    if (room && room.hostId === socket.id && room.state === 'LOBBY') {
      room.currentQuestionIndex = 0;
      startQuestion(pin, room);
    }
  });

  // HOST advances the state
  socket.on('host:next', ({ pin }) => {
    const room = rooms[pin];
    if (!room || room.hostId !== socket.id) return;

    if (room.state === 'REVEAL') {
      // Go to leaderboard
      room.state = 'LEADERBOARD';
      const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
      io.to(pin).emit('game:state-update', { state: 'LEADERBOARD', leaderboard: sortedPlayers.slice(0, 5) });
    } else if (room.state === 'LEADERBOARD') {
      // Go to next question or podium
      if (room.currentQuestionIndex + 1 < room.questions.length) {
        room.currentQuestionIndex++;
        startQuestion(pin, room);
      } else {
        room.state = 'PODIUM';
        const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
        io.to(pin).emit('game:state-update', { state: 'PODIUM', podium: sortedPlayers.slice(0, 3) });
      }
    }
  });

  // PLAYER submits answer
  socket.on('player:submit-answer', ({ pin, answerIndex }) => {
    const room = rooms[pin];
    if (!room || room.state !== 'QUESTION_ACTIVE') return;
    
    // Player already answered?
    if (room.answers[socket.id]) return;

    const timeElapsed = Date.now() - (room.questionStartTime || Date.now());
    const q = room.questions[room.currentQuestionIndex];
    const isCorrect = answerIndex === q.correctIndex;
    
    let points = 0;
    if (isCorrect) {
      // Max 1000 points, min 500 points depending on speed
      const timeLimitMs = q.timeLimit * 1000;
      const timeRatio = Math.min(timeElapsed / timeLimitMs, 1);
      points = Math.round(1000 * (1 - (timeRatio * 0.5)));
    }

    room.answers[socket.id] = { answerIndex, isCorrect, points };

    // Update player score
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.score += points;
      if (isCorrect) player.streak += 1;
      else player.streak = 0;

      // Notify player immediately
      socket.emit('player:answer-result', { 
        isCorrect, 
        pointsGained: points,
        totalScore: player.score,
        streak: player.streak
      });
    }

    // Check if everyone answered
    if (Object.keys(room.answers).length >= room.players.length) {
      endQuestion(pin, room);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Handle player/host disconnect if needed
  });
});

function startQuestion(pin: string, room: Room) {
  room.state = 'QUESTION_INTRO';
  room.answers = {};
  const q = room.questions[room.currentQuestionIndex];
  
  // Emit intro to everyone
  io.to(pin).emit('game:state-update', {
    state: 'QUESTION_INTRO',
    title: q.text,
    questionNumber: room.currentQuestionIndex + 1,
    totalQuestions: room.questions.length
  });

  // Wait 3 seconds, then activate question
  setTimeout(() => {
    if (rooms[pin] && rooms[pin].state === 'QUESTION_INTRO') {
      room.state = 'QUESTION_ACTIVE';
      room.questionStartTime = Date.now();
      
      io.to(pin).emit('game:state-update', {
        state: 'QUESTION_ACTIVE',
        question: {
          text: q.text,
          options: q.options,
          timeLimit: q.timeLimit
        }
      });

      // Set timeout for question end
      room.questionTimeout = setTimeout(() => {
        if (rooms[pin] && rooms[pin].state === 'QUESTION_ACTIVE') {
          endQuestion(pin, room);
        }
      }, q.timeLimit * 1000);
    }
  }, 3000);
}

function endQuestion(pin: string, room: Room) {
  if (room.questionTimeout) clearTimeout(room.questionTimeout);
  room.state = 'REVEAL';
  
  const q = room.questions[room.currentQuestionIndex];
  
  // Calculate distribution
  const distribution = [0, 0, 0, 0];
  Object.values(room.answers).forEach(ans => {
    distribution[ans.answerIndex]++;
  });

  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  // Notify everyone the question ended
  io.to(pin).emit('game:state-update', {
    state: 'REVEAL',
    correctIndex: q.correctIndex,
    distribution,
    leaderboard: sortedPlayers.slice(0, 5)
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
