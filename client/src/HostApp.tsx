import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, Play, ArrowLeft, Triangle, Diamond, Circle, Square } from 'lucide-react';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  GameState, 
  Player 
} from '../../shared/types';

const SERVER_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? `http://${window.location.hostname}:3001` 
  : 'https://mentex-mkii.onrender.com';
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL);

export default function HostApp() {
  const [pin, setPin] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [questionData, setQuestionData] = useState<{title?: string; num?: number; total?: number; text?: string; options?: string[]; timeLimit?: number} | null>(null);
  const [revealData, setRevealData] = useState<{correctIndex: number; distribution: number[]} | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/quizzes`)
      .then(res => res.json())
      .then(data => setQuizzes(data));

    socket.on('room-created', (data) => setPin(data.pin));
    socket.on('player-joined', (updatedPlayers) => setPlayers(updatedPlayers));
    
    socket.on('game:state-update', (data) => {
      setGameState(data.state);
      if (data.state === 'QUESTION_INTRO') {
        setQuestionData({ title: data.title, num: data.questionNumber, total: data.totalQuestions });
      } else if (data.state === 'QUESTION_ACTIVE') {
        if ('question' in data && data.question) {
          setQuestionData(data.question);
          setTimeLeft(data.question.timeLimit);
        }
      } else if (data.state === 'REVEAL') {
        if ('correctIndex' in data && 'distribution' in data) {
          setRevealData({ correctIndex: data.correctIndex, distribution: data.distribution });
        }
        if ('leaderboard' in data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } else if (data.state === 'LEADERBOARD') {
        if ('leaderboard' in data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } else if (data.state === 'PODIUM') {
        if ('podium' in data && data.podium) {
          setLeaderboard(data.podium);
        }
      }
    });

    return () => {
      socket.off('room-created');
      socket.off('player-joined');
      socket.off('game:state-update');
    };
  }, []);

  useEffect(() => {
    if (gameState === 'QUESTION_ACTIVE' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, timeLeft]);

  const selectQuiz = (id: number) => {
    setSelectedQuiz(id);
    socket.emit('host:create-room', { quizId: id });
  };

  const startGame = () => {
    if (pin) socket.emit('host:start-game', { pin });
  };

  const nextState = () => {
    if (pin) socket.emit('host:next', { pin });
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
  const shadows = ['shadow-red-500/50', 'shadow-blue-500/50', 'shadow-yellow-500/50', 'shadow-green-500/50'];
  const Icons = [Triangle, Diamond, Circle, Square];

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      
      {!selectedQuiz && gameState === 'LOBBY' && (
        <main className="flex-1 flex flex-col items-center p-12 overflow-y-auto">
          <h1 className="text-5xl font-black text-indigo-400 mb-2">MenteX</h1>
          <h2 className="text-xl text-slate-400 mb-12">Selecione um Quiz para ser o Host:</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {quizzes.map(q => (
              <button 
                key={q.id} 
                onClick={() => selectQuiz(q.id)} 
                className="bg-slate-800 hover:bg-indigo-600 p-8 rounded-2xl transition-all hover:-translate-y-2 text-left border border-slate-700 shadow-xl"
              >
                <h3 className="text-2xl font-bold mb-2">{q.title}</h3>
                {q.description && <p className="text-slate-300 mb-4">{q.description}</p>}
                <p className="text-indigo-300 font-bold bg-black/20 inline-block px-3 py-1 rounded-lg">
                  {q.questions?.length || 0} perguntas
                </p>
              </button>
            ))}
            {quizzes.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-12">
                Nenhum quiz disponível. Crie um acessando /admin.
              </div>
            )}
          </div>
        </main>
      )}

      {selectedQuiz && gameState === 'LOBBY' && (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative h-full">
          <header className="p-4 md:p-6 flex justify-between items-center bg-black/20 backdrop-blur-md z-10 border-b border-white/10 shrink-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
              MenteX <span className="text-white/60 font-normal text-lg md:text-xl">/ Host</span>
            </h1>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20">
                <Users size={20} className="text-white/80" />
                <span className="font-bold text-lg">{players.length}</span>
              </div>
              <button 
                onClick={startGame} 
                disabled={players.length === 0} 
                className="bg-white text-indigo-900 hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40 transition-all px-4 py-2 md:px-8 md:py-3 rounded-xl font-black text-base md:text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:shadow-none"
              >
                <Play size={20} fill="currentColor" /> Iniciar Jogo
              </button>
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-0">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
            <div className="bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/20 text-center max-w-4xl w-full z-10 relative">
              <h2 className="text-white/80 text-xl md:text-3xl mb-4 font-bold tracking-wide">Junte-se ao jogo com o PIN:</h2>
              <div className="text-7xl md:text-9xl font-black tracking-widest text-white my-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                {pin || '------'}
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-8 min-h-[50px] max-h-48 overflow-y-auto">
                {players.map((p, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-md py-2 px-4 rounded-full text-lg md:text-2xl font-bold text-white shadow-lg animate-fade-in border border-white/30">
                    {p.nickname}
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="text-white/50 text-xl font-medium animate-pulse">
                    Aguardando jogadores...
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {gameState === 'QUESTION_INTRO' && questionData && (
        <main className="flex-1 flex flex-col items-center justify-center bg-indigo-600 relative overflow-hidden h-full">
          <div className="absolute w-[200%] h-[200%] bg-indigo-500/20 animate-spin-slow rounded-[40%] pointer-events-none"></div>
          <h2 className="text-2xl md:text-4xl font-medium text-indigo-200 mb-4 z-10">Pergunta {questionData.num} de {questionData.total}</h2>
          <h1 className="text-5xl md:text-7xl font-black text-center max-w-5xl leading-tight z-10 drop-shadow-xl px-4">{questionData.title}</h1>
          <div className="mt-12 text-3xl font-bold animate-pulse text-indigo-200 z-10">Prepare-se...</div>
        </main>
      )}

      {gameState === 'QUESTION_ACTIVE' && questionData && questionData.options && (
        <main className="flex-1 flex flex-col items-center p-4 md:p-6 bg-slate-100 relative min-h-0">
          <div className="text-3xl md:text-4xl font-black mb-2 bg-white px-8 py-4 rounded-3xl w-full max-w-6xl text-center shadow-[0_5px_20px_rgba(0,0,0,0.05)] text-slate-800 border-b-4 border-slate-200 shrink-0">
            {questionData.text}
          </div>
          <div className="flex-1 flex w-full items-center justify-center min-h-0 py-2">
            <div className="text-7xl md:text-8xl font-black bg-indigo-600 text-white h-24 w-24 md:h-32 md:w-32 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] border-[6px] border-white z-10 shrink-0">
              {timeLeft}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full h-[30vh] min-h-[120px] max-h-[220px] max-w-6xl shrink-0">
            {questionData.options.map((opt, i) => {
              const Icon = Icons[i];
              return (
                <div key={i} className={`${colors[i]} ${shadows[i]} flex items-center p-4 md:p-6 rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.15)] transform transition hover:scale-[1.01] cursor-default border-b-[6px] border-black/20 h-full overflow-hidden`}>
                  <div className="bg-black/10 p-3 md:p-4 rounded-xl mr-4 shrink-0">
                    <Icon size={36} className="text-white drop-shadow-md" fill="currentColor" />
                  </div>
                  <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md break-words line-clamp-2">{opt}</span>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {gameState === 'REVEAL' && revealData && (
        <main className="flex-1 flex flex-col items-center p-8 bg-slate-100">
          <div className="flex justify-between items-center w-full max-w-5xl mb-12">
            <div className="text-5xl font-black bg-white px-12 py-6 rounded-3xl text-center flex-1 shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-slate-800 border-b-4 border-slate-200">
              Resultado
            </div>
            <button onClick={nextState} className="bg-indigo-600 ml-6 px-10 py-6 rounded-3xl font-black text-2xl text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 border-b-4 border-indigo-800">
              Avançar ❯
            </button>
          </div>
          <div className="flex-1 flex items-end justify-center gap-12 w-full max-w-5xl pb-16">
            {revealData.distribution.map((count, i) => {
              const Icon = Icons[i];
              const isCorrect = i === revealData.correctIndex;
              return (
                <div key={i} className={`flex flex-col items-center w-40 gap-4 transition-all duration-1000 ${isCorrect ? 'scale-110' : 'opacity-40 grayscale'}`}>
                  <span className={`text-5xl font-black ${isCorrect ? 'text-green-600' : 'text-slate-500'}`}>{count}</span>
                  <div 
                    className={`w-full rounded-t-2xl transition-all duration-1000 ${colors[i]} shadow-2xl relative overflow-hidden`}
                    style={{ height: `${count === 0 ? 30 : count * 80}px`, minHeight: '30px' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                  </div>
                  <div className={`w-full h-20 ${colors[i]} rounded-b-2xl flex items-center justify-center border-b-[6px] border-black/20 shadow-xl relative z-10`}>
                    <Icon size={40} className="text-white drop-shadow-md" fill="currentColor" />
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {gameState === 'LEADERBOARD' && (
        <main className="flex-1 flex flex-col items-center p-12 bg-indigo-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 to-slate-900/95 pointer-events-none"></div>
          <div className="flex justify-between items-center w-full max-w-5xl mb-12 z-10">
            <h1 className="text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Placar</h1>
            <button onClick={nextState} className="bg-white text-indigo-900 px-10 py-5 rounded-3xl font-black text-2xl hover:bg-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-b-4 border-slate-300 transition-transform hover:scale-105">
              Próximo ❯
            </button>
          </div>
          <div className="w-full max-w-5xl space-y-4 z-10">
            {leaderboard.map((p, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-6 px-8 rounded-2xl flex justify-between items-center text-4xl font-bold transform transition-all hover:scale-[1.02] shadow-xl border border-white/20">
                <span className="flex items-center gap-6">
                  <span className="text-white/60 w-12 text-right text-3xl">{i + 1}.</span> 
                  <span className="text-white drop-shadow-md">{p.nickname}</span>
                </span>
                <span className="text-indigo-300">{p.score} <span className="text-2xl font-medium text-white/50">pts</span></span>
              </div>
            ))}
          </div>
        </main>
      )}

      {gameState === 'PODIUM' && (
        <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 pointer-events-none"></div>
          
          <h1 className="text-[8rem] font-black mb-24 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-bounce z-10">
            PÓDIO
          </h1>
          
          <div className="flex items-end justify-center gap-6 h-[500px] w-full max-w-5xl z-10">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="w-1/3 flex flex-col items-center justify-end h-[75%] animate-fade-in relative group" style={{ animationDelay: '1s' }}>
                <span className="text-4xl font-bold mb-4 break-words px-4 text-center text-white drop-shadow-lg">{leaderboard[1].nickname}</span>
                <span className="text-2xl text-slate-300 mb-6 font-medium">{leaderboard[1].score} pts</span>
                <div className="bg-gradient-to-b from-slate-300 to-slate-500 w-full h-full rounded-t-3xl flex items-start justify-center pt-8 text-7xl text-slate-800 font-black shadow-[0_-20px_50px_rgba(203,213,225,0.4)] border-t-[8px] border-white/40">
                  2
                </div>
              </div>
            )}
            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="w-1/3 flex flex-col items-center justify-end h-full animate-fade-in relative" style={{ animationDelay: '2s' }}>
                <div className="absolute -top-32 w-full flex justify-center animate-spin-slow">
                  <div className="w-64 h-64 bg-yellow-400/20 blur-3xl rounded-full"></div>
                </div>
                <span className="text-6xl font-black mb-4 text-yellow-300 break-words px-4 text-center drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] relative z-10">{leaderboard[0].nickname}</span>
                <span className="text-3xl text-yellow-100 mb-6 font-bold relative z-10">{leaderboard[0].score} pts</span>
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 w-full h-full rounded-t-3xl flex items-start justify-center pt-8 text-[7rem] leading-none text-yellow-900 font-black shadow-[0_-20px_80px_rgba(250,204,21,0.6)] border-t-[8px] border-white/50 relative z-10">
                  1
                </div>
              </div>
            )}
            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="w-1/3 flex flex-col items-center justify-end h-[60%] animate-fade-in" style={{ animationDelay: '0s' }}>
                <span className="text-3xl font-bold mb-4 break-words px-4 text-center text-white drop-shadow-lg">{leaderboard[2].nickname}</span>
                <span className="text-xl text-orange-200 mb-6 font-medium">{leaderboard[2].score} pts</span>
                <div className="bg-gradient-to-b from-orange-400 to-orange-600 w-full h-full rounded-t-3xl flex items-start justify-center pt-8 text-6xl text-orange-950 font-black shadow-[0_-20px_50px_rgba(251,146,60,0.4)] border-t-[8px] border-white/30">
                  3
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
