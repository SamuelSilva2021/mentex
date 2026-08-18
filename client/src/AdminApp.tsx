import { useState, useEffect } from 'react';
import { Play, Plus, Edit, Trash2, X, LogOut, User, Sparkles } from 'lucide-react';
import QuizEditor from './QuizEditor';
import AuthForm from './AuthForm';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3001/api`
  : 'https://mentex-mkii.onrender.com/api';

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('mentex_token'));
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('mentex_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDescription, setNewQuizDescription] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  // Validate session on mount
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token inválido');
          return res.json();
        })
        .then(data => {
          setUser(data.user);
          localStorage.setItem('mentex_user', JSON.stringify(data.user));
          fetchQuizzes(token);
        })
        .catch(() => {
          handleLogout();
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    localStorage.setItem('mentex_token', newToken);
    localStorage.setItem('mentex_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    fetchQuizzes(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('mentex_token');
    localStorage.removeItem('mentex_user');
    setToken(null);
    setUser(null);
    setQuizzes([]);
    setLoading(false);
  };

  const fetchQuizzes = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quizzes?admin=true`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error('Failed to fetch quizzes', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewQuizTitle('');
    setNewQuizDescription('');
    setIsCreateModalOpen(true);
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim() || !token) return;

    try {
      const res = await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: newQuizTitle.trim(), 
          description: newQuizDescription.trim() || undefined 
        })
      });
      if (!res.ok) throw new Error('Erro ao criar quiz.');
      setIsCreateModalOpen(false);
      setNewQuizTitle('');
      setNewQuizDescription('');
      fetchQuizzes(token);
    } catch (e) {
      console.error(e);
      alert('Erro ao criar o quiz.');
    }
  };

  const confirmDelete = (id: number) => {
    setQuizToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteQuiz = async () => {
    if (quizToDelete === null || !token) return;
    try {
      const res = await fetch(`${API_URL}/quizzes/${quizToDelete}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro ao deletar quiz.');
      setIsDeleteModalOpen(false);
      setQuizToDelete(null);
      fetchQuizzes(token);
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir o quiz.');
    }
  };

  // If not logged in, render the Auth Form
  if (!token) {
    return <AuthForm apiUrl={API_URL} onSuccess={handleAuthSuccess} />;
  }

  if (editingQuizId) {
    const quiz = quizzes.find(q => q.id === editingQuizId);
    if (quiz) {
      return (
        <QuizEditor 
          quiz={quiz} 
          token={token}
          onClose={() => setEditingQuizId(null)} 
          onSave={() => {
            setEditingQuizId(null);
            fetchQuizzes(token);
          }} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-indigo-400">MenteX <span className="text-white">Admin</span></h1>
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                Painel
              </span>
            </div>
            <p className="text-slate-400 mt-1">Gerencie seus quizzes e perguntas exclusivas</p>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="bg-slate-800/90 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-200">{user?.name || 'Usuário'}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Sair da Conta"
              className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 p-3 rounded-xl transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Meus Quizzes</h2>
            <p className="text-slate-400 text-sm">{quizzes.length} quiz(zes) cadastrados na sua conta</p>
          </div>

          <div className="flex gap-3">
            <a 
              href="/host" 
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 text-slate-300 transition-colors"
            >
              <Play size={18} className="text-green-400" /> Ir para Host
            </a>
            <button 
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus size={20} /> Novo Quiz
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-16">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Carregando seus quizzes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors flex flex-col justify-between shadow-lg">
                <div>
                  <h3 className="text-2xl font-bold mb-1 text-white">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-slate-300 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                  )}
                  <p className="text-slate-400 text-sm mb-6 font-medium">{quiz.questions?.length || 0} perguntas</p>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => setEditingQuizId(quiz.id)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                    <Edit size={18} /> Editar Perguntas
                  </button>
                  <button onClick={() => confirmDelete(quiz.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-16 bg-slate-800/40 rounded-3xl border border-slate-800 border-dashed">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={24} />
                </div>
                <p className="text-slate-300 text-lg font-bold">Nenhum quiz na sua conta ainda.</p>
                <p className="text-slate-500 text-sm mt-1 mb-6">Crie seu primeiro quiz agora para jogar com seus amigos!</p>
                <button 
                  onClick={openCreateModal}
                  className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus size={18} /> Criar Primeiro Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Modal for Create Quiz */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Criar Novo Quiz</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateQuizSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Nome do Quiz *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Ex: Conhecimentos Gerais"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newQuizDescription}
                  onChange={(e) => setNewQuizDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="Ex: Quiz bíblico com 50 questões..."
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newQuizTitle.trim()}
                  className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Criar Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Modal for Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Excluir Quiz?</h2>
            <p className="text-slate-400 mb-8">Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita.</p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={deleteQuiz}
                className="px-6 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
