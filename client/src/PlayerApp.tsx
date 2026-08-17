import { useState, useEffect, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { Triangle, Diamond, Circle, Square, Check, X, Flame } from 'lucide-react';
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

export default function PlayerApp() {
  const [pin, setPin] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [answerResult, setAnswerResult] = useState<{isCorrect: boolean; pointsGained: number; totalScore: number; streak: number} | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [questionData, setQuestionData] = useState<{text: string; options: string[]; timeLimit: number} | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    socket.on('join-success', () => {
      setJoined(true);
      setError('');
    });

    socket.on('error', (msg) => {
      setError(msg);
    });

    socket.on('game:state-update', (data) => {
      setGameState(data.state);
      if (data.state === 'QUESTION_INTRO' || data.state === 'QUESTION_ACTIVE') {
        setAnswerResult(null);
        setSubmitted(false);
        if ('question' in data && data.question) {
          setQuestionData(data.question);
        }
      } else if (data.state === 'REVEAL' || data.state === 'LEADERBOARD' || data.state === 'PODIUM') {
        if ('leaderboard' in data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        } else if ('podium' in data && data.podium) {
          setLeaderboard(data.podium);
        }
      }
    });

    socket.on('player:answer-result', (data) => {
      setAnswerResult(data);
    });

    return () => {
      socket.off('join-success');
      socket.off('error');
      socket.off('game:state-update');
      socket.off('player:answer-result');
    };
  }, []);

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (pin && nickname) {
      socket.emit('player:join', { pin, nickname });
    }
  };

  const submitAnswer = (index: number) => {
    if (!submitted) {
      setSubmitted(true);
      socket.emit('player:submit-answer', { pin, answerIndex: index });
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
  const shadows = ['shadow-red-500/50', 'shadow-blue-500/50', 'shadow-yellow-500/50', 'shadow-green-500/50'];
  const activeColors = ['active:bg-red-600', 'active:bg-blue-600', 'active:bg-yellow-600', 'active:bg-green-600'];
  const Icons = [Triangle, Diamond, Circle, Square];

  if (joined) {
    if (gameState === 'LOBBY') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[50px] mix-blend-screen pointer-events-none"></div>
          <h2 className="text-4xl font-black mb-6 drop-shadow-md z-10">Você está dentro!</h2>
          <p className="text-white/80 text-xl font-medium z-10 mb-12">Veja seu apelido no telão.</p>
          <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-full border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] z-10">
            <span className="text-3xl font-black tracking-wide">{nickname}</span>
          </div>
        </div>
      );
    }

    if (gameState === 'QUESTION_INTRO') {
      return (
        <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
          <div className="absolute w-[150%] h-[150%] bg-white/10 animate-spin-slow rounded-[40%] pointer-events-none"></div>
          <h2 className="text-5xl font-black mb-6 animate-pulse z-10 drop-shadow-lg">Prepare-se!</h2>
          <p className="text-2xl font-bold text-indigo-200 z-10">Olhe para o telão</p>
        </div>
      );
    }

    if (gameState === 'QUESTION_ACTIVE') {
      if (submitted) {
        return (
          <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-6 text-white text-center">
            <h2 className="text-4xl font-black mb-4 animate-pulse">Aguardando...</h2>
            <p className="text-xl text-slate-400 font-medium">Esperando os outros jogadores.</p>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex flex-col p-2 bg-slate-100">
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
            {colors.map((color, index) => {
              const Icon = Icons[index];
              return (
                <button 
                  key={index}
                  onClick={() => submitAnswer(index)}
                  className={`${color} ${activeColors[index]} ${shadows[index]} rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center p-4 border-b-[8px] border-black/20`}
                >
                  <Icon size={100} className="text-white drop-shadow-md" fill="currentColor" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (gameState === 'REVEAL') {
      const isCorrect = answerResult?.isCorrect;
      return (
        <div className={`min-h-screen flex flex-col items-center p-8 text-white text-center overflow-y-auto ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="mt-8 mb-12 animate-bounce">
            {isCorrect ? <Check size={80} strokeWidth={4} /> : <X size={80} strokeWidth={4} />}
          </div>
          
          <h2 className="text-5xl font-black mb-12 drop-shadow-lg tracking-wide">
            {isCorrect ? 'Correto!' : 'Incorreto!'}
          </h2>
          
          <div className="bg-black/20 backdrop-blur-sm p-8 rounded-3xl w-full max-w-sm mb-8 shadow-xl border border-white/10">
            <p className="text-xl font-medium opacity-90 mb-2">Pontos ganhos</p>
            <p className="text-6xl font-black mb-8 drop-shadow-md">+{answerResult?.pointsGained || 0}</p>
            
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl mb-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black">{answerResult?.totalScore || 0}</span>
            </div>
            
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl">
              <span className="text-lg font-bold">Sequência</span>
              <span className="text-2xl font-black flex items-center gap-2">
                {answerResult?.streak || 0} <Flame fill="currentColor" className={answerResult?.streak ? 'text-orange-400' : 'text-slate-400'} />
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (gameState === 'LEADERBOARD') {
      return (
        <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 pointer-events-none"></div>
          <h2 className="text-4xl font-black mb-6 z-10">Placar Atual</h2>
          <p className="text-2xl font-medium text-indigo-200 mb-12 z-10">Olhe para o telão!</p>
          <div className="bg-black/30 backdrop-blur-sm px-8 py-6 rounded-2xl z-10 border border-white/10 shadow-xl">
            <p className="text-lg text-indigo-200 mb-2">Sua pontuação</p>
            <p className="text-5xl font-black">{answerResult?.totalScore || 0}</p>
          </div>
        </div>
      );
    }

    if (gameState === 'PODIUM') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-500/10 blur-[100px] z-0 pointer-events-none"></div>
          <h2 className="text-5xl font-black mb-6 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10">Fim de Jogo!</h2>
          <p className="text-2xl font-bold mb-12 z-10 text-white/80">Olhe para a tela principal!</p>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl z-10 border border-white/20 shadow-2xl">
            <p className="text-xl text-white/60 mb-4 font-medium">Pontuação Final</p>
            <p className="text-6xl font-black text-yellow-300 drop-shadow-md">{answerResult?.totalScore || 0}</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
      
      <div className="w-full max-w-sm z-10">
        <h1 className="text-6xl font-black text-center mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] tracking-wider">MenteX</h1>
        
        <form onSubmit={handleJoin} className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
          {error && <div className="bg-red-500/80 backdrop-blur-md text-white p-4 rounded-xl text-center font-bold shadow-lg animate-bounce">{error}</div>}
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="PIN do Jogo"
              className="w-full text-center text-3xl font-black px-4 py-4 rounded-2xl bg-white/90 text-slate-800 focus:bg-white focus:outline-none focus:ring-4 ring-indigo-400 transition-all shadow-inner placeholder:text-slate-400 placeholder:font-bold"
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <input
              type="text"
              placeholder="Apelido"
              className="w-full text-center text-xl font-bold px-4 py-4 rounded-2xl bg-white/90 text-slate-800 focus:bg-white focus:outline-none focus:ring-4 ring-indigo-400 transition-all shadow-inner placeholder:text-slate-400"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={15}
            />
          </div>
          
          <button
            type="submit"
            disabled={!pin || !nickname}
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-2xl text-2xl transition-all disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-95 shadow-xl border-b-4 border-slate-950 disabled:border-b-0"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
