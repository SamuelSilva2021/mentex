import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Users, Play, Triangle, Diamond, Circle, Square, LogOut } from 'lucide-react';
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
  const [isReconnecting, setIsReconnecting] = useState<boolean>(true);
  const [randomize, setRandomize] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('mentex_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`${SERVER_URL}/api/quizzes`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuizzes(data);
        }
      })
      .catch(console.error);

    const savedPin = sessionStorage.getItem('mentex-host-session');
    if (savedPin) {
      socket.emit('host:reconnect', { pin: savedPin });
    } else {
      setIsReconnecting(false);
    }

    socket.on('room-created', (data) => {
      setPin(data.pin);
      sessionStorage.setItem('mentex-host-session', data.pin);
      setSelectedQuiz(-1); // bypass quiz selection
      setIsReconnecting(false);
    });

    socket.on('error', () => {
      sessionStorage.removeItem('mentex-host-session');
      setIsReconnecting(false);
    });

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
      socket.off('error');
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
    const quiz = quizzes.find(q => q.id === id);
    if (quiz) {
      setQuestionCount(quiz.questions?.length || 0);
    }
    socket.emit('host:create-room', { quizId: id });
  };

  const startGame = () => {
    if (pin) socket.emit('host:start-game', { pin, randomize, questionCount });
  };

  const nextState = () => {
    if (pin) socket.emit('host:next', { pin });
  };

  const endGame = () => {
    if (pin) {
      socket.emit('host:end-game', { pin });
      sessionStorage.removeItem('mentex-host-session');
      setPin(null);
      setSelectedQuiz(null);
      setGameState('LOBBY');
      setPlayers([]);
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
  const shadows = ['shadow-red-500/50', 'shadow-blue-500/50', 'shadow-yellow-500/50', 'shadow-green-500/50'];
  const Icons = [Triangle, Diamond, Circle, Square];

  if (isReconnecting) {
    return (
      <div className="h-[100dvh] w-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-black animate-pulse">Reconectando sala...</h2>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* 1. QUIZ SELECTOR SCREEN */}
      {!selectedQuiz && gameState === 'LOBBY' && (
        <main className="flex-1 flex flex-col items-center p-4 sm:p-8 md:p-12 overflow-y-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-indigo-400 mb-2">MenteX</h1>
          <h2 className="text-base sm:text-xl text-slate-400 mb-6 sm:mb-12 text-center">Selecione um Quiz para ser o Host:</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl">
            {quizzes.map(q => (
              <button 
                key={q.id} 
                onClick={() => selectQuiz(q.id)} 
                className="bg-slate-800 hover:bg-indigo-600 p-5 sm:p-8 rounded-2xl transition-all hover:-translate-y-1 sm:hover:-translate-y-2 text-left border border-slate-700 shadow-xl"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">{q.title}</h3>
                {q.description && <p className="text-slate-300 text-sm sm:text-base mb-4 line-clamp-2">{q.description}</p>}
                <p className="text-indigo-300 font-bold bg-black/30 inline-block px-3 py-1 rounded-lg text-xs sm:text-sm">
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

      {/* 2. LOBBY SCREEN */}
      {selectedQuiz && gameState === 'LOBBY' && (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative h-full">
          {/* Responsive Header */}
          <header className="p-3 sm:p-4 md:p-6 bg-black/30 backdrop-blur-md z-10 border-b border-white/10 shrink-0">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              {/* Logo & Players row on mobile */}
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-3">
                  <button onClick={endGame} className="text-white/60 hover:text-red-400 transition-colors p-1" title="Encerrar Jogo">
                    <LogOut size={24} className="sm:w-7 sm:h-7" />
                  </button>
                  <span>MenteX <span className="text-white/60 font-normal text-sm sm:text-lg md:text-xl">/ Host</span></span>
                </h1>

                {/* Player count on mobile */}
                <div className="md:hidden bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/20">
                  <Users size={16} className="text-white/80" />
                  <span className="font-bold text-sm sm:text-base">{players.length}</span>
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                {/* Randomize toggle */}
                <label className="flex items-center gap-1.5 sm:gap-2 text-white/80 cursor-pointer bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-xs sm:text-sm md:text-base">
                  <input 
                    type="checkbox" 
                    checked={randomize}
                    onChange={(e) => setRandomize(e.target.checked)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-medium whitespace-nowrap">Aleatorizar</span>
                </label>

                {/* Question count */}
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-white/20 text-xs sm:text-sm md:text-base">
                  <label className="text-white/80 font-medium whitespace-nowrap">Qtd:</label>
                  <input 
                    type="number" 
                    min="1"
                    max={quizzes.find(q => q.id === selectedQuiz)?.questions?.length || 1}
                    value={questionCount || ''}
                    onChange={e => setQuestionCount(parseInt(e.target.value) || 1)}
                    className="bg-transparent text-white font-bold w-9 sm:w-12 focus:outline-none text-center"
                    title="Quantidade de perguntas para usar no jogo"
                  />
                </div>

                {/* Player count on desktop */}
                <div className="hidden md:flex bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl items-center gap-2 border border-white/20">
                  <Users size={20} className="text-white/80" />
                  <span className="font-bold text-lg">{players.length}</span>
                </div>

                {/* Start Game Button */}
                <button 
                  onClick={startGame} 
                  disabled={players.length === 0} 
                  className="flex-1 sm:flex-initial bg-white text-indigo-900 hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40 transition-all px-3.5 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-xl font-black text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:shadow-none"
                >
                  <Play size={16} className="sm:w-5 sm:h-5" fill="currentColor" /> 
                  <span className="whitespace-nowrap">Iniciar Jogo</span>
                </button>
              </div>
            </div>
          </header>

          {/* Lobby Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 relative min-h-0">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
            
            <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20 text-center max-w-4xl w-full z-10 relative">
              <h2 className="text-white/80 text-base sm:text-2xl md:text-3xl mb-2 sm:mb-4 font-bold tracking-wide">
                Junte-se ao jogo com o PIN:
              </h2>
              
              <div className="text-5xl sm:text-7xl md:text-9xl font-black tracking-widest text-white my-3 sm:my-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)] select-all">
                {pin || '------'}
              </div>

              {/* Players chips */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-8 min-h-[40px] max-h-36 sm:max-h-48 overflow-y-auto px-1">
                {players.map((p, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-md py-1.5 px-3 sm:py-2 sm:px-4 rounded-full text-sm sm:text-lg md:text-xl font-bold text-white shadow-lg animate-fade-in border border-white/30">
                    {p.nickname}
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="text-white/50 text-base sm:text-xl font-medium animate-pulse">
                    Aguardando jogadores...
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 3. QUESTION INTRO SCREEN */}
      {gameState === 'QUESTION_INTRO' && questionData && (
        <main className="flex-1 flex flex-col items-center justify-center bg-indigo-600 relative overflow-hidden h-full p-4 text-center">
          <div className="absolute w-[200%] h-[200%] bg-indigo-500/20 animate-spin-slow rounded-[40%] pointer-events-none"></div>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-medium text-indigo-200 mb-3 sm:mb-4 z-10">
            Pergunta {questionData.num} de {questionData.total}
          </h2>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-center max-w-5xl leading-tight z-10 drop-shadow-xl px-2">
            {questionData.title}
          </h1>
          <div className="mt-8 sm:mt-12 text-2xl sm:text-3xl font-bold animate-pulse text-indigo-200 z-10">
            Prepare-se...
          </div>
        </main>
      )}

      {/* 4. ACTIVE QUESTION SCREEN */}
      {gameState === 'QUESTION_ACTIVE' && questionData && questionData.options && (
        <main className="flex-1 flex flex-col items-center p-3 sm:p-4 md:p-6 bg-slate-100 relative min-h-0 overflow-y-auto">
          {/* Question Text */}
          <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 bg-white px-4 py-3 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl w-full max-w-6xl text-center shadow-[0_5px_20px_rgba(0,0,0,0.05)] text-slate-800 border-b-4 border-slate-200 shrink-0">
            {questionData.text}
          </div>
          
          {/* Timer Circle */}
          <div className="flex-1 flex w-full items-center justify-center min-h-[70px] sm:min-h-0 py-1 sm:py-2">
            <div className="text-3xl sm:text-6xl md:text-8xl font-black bg-indigo-600 text-white h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] border-4 sm:border-[6px] border-white z-10 shrink-0">
              {timeLeft}
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full max-w-6xl shrink-0">
            {questionData.options.map((opt, i) => {
              const Icon = Icons[i];
              return (
                <div key={i} className={`${colors[i]} ${shadows[i]} flex items-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_20px_rgb(0,0,0,0.15)] transform transition hover:scale-[1.01] cursor-default border-b-4 sm:border-b-[6px] border-black/20 overflow-hidden`}>
                  <div className="bg-black/10 p-2 sm:p-3 md:p-4 rounded-xl mr-3 sm:mr-4 shrink-0">
                    <Icon size={24} className="sm:w-8 sm:h-8 md:w-9 md:h-9 text-white drop-shadow-md" fill="currentColor" />
                  </div>
                  <span className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-md break-words line-clamp-2">{opt}</span>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 5. REVEAL SCREEN */}
      {gameState === 'REVEAL' && revealData && (
        <main className="flex-1 flex flex-col items-center p-4 sm:p-6 md:p-8 bg-slate-100 overflow-y-auto">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl gap-3 sm:gap-6 mb-6 sm:mb-12">
            <div className="text-2xl sm:text-4xl md:text-5xl font-black bg-white px-6 py-3 sm:px-12 sm:py-5 rounded-2xl sm:rounded-3xl text-center w-full sm:flex-1 shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-slate-800 border-b-4 border-slate-200">
              Resultado
            </div>
            <button 
              onClick={nextState} 
              className="w-full sm:w-auto bg-indigo-600 px-6 py-3 sm:px-10 sm:py-5 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-2xl text-white hover:bg-indigo-500 shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 border-b-4 border-indigo-800"
            >
              Avançar ❯
            </button>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 flex items-end justify-center gap-3 sm:gap-6 md:gap-12 w-full max-w-5xl pb-6 sm:pb-16 min-h-[220px]">
            {revealData.distribution.map((count, i) => {
              const Icon = Icons[i];
              const isCorrect = i === revealData.correctIndex;
              return (
                <div key={i} className={`flex flex-col items-center flex-1 max-w-[100px] sm:max-w-[140px] md:max-w-[160px] gap-2 sm:gap-4 transition-all duration-1000 ${isCorrect ? 'scale-105 sm:scale-110' : 'opacity-40 grayscale'}`}>
                  <span className={`text-2xl sm:text-4xl md:text-5xl font-black ${isCorrect ? 'text-green-600' : 'text-slate-500'}`}>{count}</span>
                  <div className="w-full flex flex-col">
                    <div 
                      className={`w-full rounded-t-xl sm:rounded-t-2xl transition-all duration-1000 ${colors[i]} shadow-2xl relative overflow-hidden`}
                      style={{ height: `${count === 0 ? 20 : Math.min(count * 50 + 20, 280)}px`, minHeight: '20px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                    </div>
                    <div className={`w-full h-12 sm:h-16 md:h-20 ${colors[i]} rounded-b-xl sm:rounded-b-2xl flex items-center justify-center border-b-4 sm:border-b-[6px] border-black/20 shadow-xl relative z-10`}>
                      <Icon size={24} className="sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-md" fill="currentColor" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* 6. LEADERBOARD SCREEN */}
      {gameState === 'LEADERBOARD' && (
        <main className="flex-1 flex flex-col items-center p-4 sm:p-8 md:p-12 bg-indigo-900 relative overflow-y-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 to-slate-900/95 pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl gap-4 mb-6 sm:mb-12 z-10">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Placar</h1>
            <div className="flex w-full sm:w-auto gap-2 sm:gap-4">
              <button 
                onClick={() => { if (pin) socket.emit('host:force-podium', { pin }) }} 
                className="flex-1 sm:flex-initial bg-red-500 text-white px-4 py-3 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl font-bold sm:font-black text-sm sm:text-xl hover:bg-red-400 shadow-[0_10px_30px_rgba(239,68,68,0.3)] border-b-4 border-red-700 transition-transform hover:scale-105 text-center"
              >
                Encerrar Jogo
              </button>
              <button 
                onClick={nextState} 
                className="flex-1 sm:flex-initial bg-white text-indigo-900 px-6 py-3 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl font-bold sm:font-black text-base sm:text-2xl hover:bg-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-b-4 border-slate-300 transition-transform hover:scale-105 text-center"
              >
                Próximo ❯
              </button>
            </div>
          </div>

          <div className="w-full max-w-5xl space-y-2 sm:space-y-4 z-10">
            {leaderboard.map((p, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-3 sm:p-5 md:p-6 px-4 sm:px-8 rounded-xl sm:rounded-2xl flex justify-between items-center text-lg sm:text-2xl md:text-4xl font-bold transform transition-all hover:scale-[1.01] shadow-xl border border-white/20">
                <span className="flex items-center gap-2 sm:gap-6 truncate mr-2">
                  <span className="text-white/60 w-6 sm:w-10 text-right text-base sm:text-2xl md:text-3xl shrink-0">{i + 1}.</span> 
                  <span className="text-white drop-shadow-md truncate">{p.nickname}</span>
                </span>
                <span className="text-indigo-300 whitespace-nowrap shrink-0">{p.score} <span className="text-xs sm:text-xl md:text-2xl font-medium text-white/50">pts</span></span>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* 7. PODIUM SCREEN */}
      {gameState === 'PODIUM' && (
        <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden h-full">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 pointer-events-none"></div>
          
          <div className="w-full flex justify-between items-center z-20">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]">
              PÓDIO
            </h1>
            <button 
              onClick={endGame} 
              className="bg-white/10 hover:bg-red-500/80 text-white px-3.5 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base transition-all border border-white/20 hover:border-red-500 shadow-lg"
            >
              Fechar Sala
            </button>
          </div>
          
          {/* Podium Pillars */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 h-[55vh] max-h-[460px] w-full max-w-4xl z-10 mt-auto pb-4">
            {/* 2nd Place */}
            {leaderboard[1] ? (
              <div className="w-1/3 flex flex-col items-center justify-end h-[75%] animate-fade-in relative" style={{ animationDelay: '1s' }}>
                <span className="text-xs sm:text-lg md:text-2xl font-bold mb-1 sm:mb-2 px-1 text-center text-white drop-shadow-lg truncate w-full">{leaderboard[1].nickname}</span>
                <span className="text-[10px] sm:text-sm md:text-lg text-slate-300 mb-2 sm:mb-4 font-medium">{leaderboard[1].score} pts</span>
                <div className="bg-gradient-to-b from-slate-300 to-slate-500 w-full h-full rounded-t-2xl sm:rounded-t-3xl flex items-start justify-center pt-3 sm:pt-6 text-3xl sm:text-6xl md:text-7xl text-slate-800 font-black shadow-[0_-10px_30px_rgba(203,213,225,0.3)] border-t-4 sm:border-t-[8px] border-white/40">
                  2
                </div>
              </div>
            ) : <div className="w-1/3" />}

            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="w-1/3 flex flex-col items-center justify-end h-full animate-fade-in relative" style={{ animationDelay: '2s' }}>
                <div className="absolute -top-20 w-full flex justify-center pointer-events-none">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 bg-yellow-400/20 blur-2xl rounded-full"></div>
                </div>
                <span className="text-sm sm:text-2xl md:text-3xl font-black mb-1 sm:mb-2 text-yellow-300 px-1 text-center drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] truncate w-full relative z-10">{leaderboard[0].nickname}</span>
                <span className="text-xs sm:text-base md:text-xl text-yellow-100 mb-2 sm:mb-4 font-bold relative z-10">{leaderboard[0].score} pts</span>
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 w-full h-full rounded-t-2xl sm:rounded-t-3xl flex items-start justify-center pt-3 sm:pt-6 text-4xl sm:text-7xl md:text-8xl leading-none text-yellow-900 font-black shadow-[0_-10px_50px_rgba(250,204,21,0.5)] border-t-4 sm:border-t-[8px] border-white/50 relative z-10">
                  1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] ? (
              <div className="w-1/3 flex flex-col items-center justify-end h-[60%] animate-fade-in" style={{ animationDelay: '0s' }}>
                <span className="text-xs sm:text-base md:text-xl font-bold mb-1 sm:mb-2 px-1 text-center text-white drop-shadow-lg truncate w-full">{leaderboard[2].nickname}</span>
                <span className="text-[10px] sm:text-xs md:text-base text-orange-200 mb-2 sm:mb-4 font-medium">{leaderboard[2].score} pts</span>
                <div className="bg-gradient-to-b from-orange-400 to-orange-600 w-full h-full rounded-t-2xl sm:rounded-t-3xl flex items-start justify-center pt-3 sm:pt-6 text-2xl sm:text-5xl md:text-6xl text-orange-950 font-black shadow-[0_-10px_30px_rgba(251,146,60,0.3)] border-t-4 sm:border-t-[8px] border-white/30">
                  3
                </div>
              </div>
            ) : <div className="w-1/3" />}
          </div>
        </main>
      )}
    </div>
  );
}
