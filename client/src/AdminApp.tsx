import { useState, useEffect } from 'react';
import { Play, Plus, Edit, Trash2, X } from 'lucide-react';
import QuizEditor from './QuizEditor';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3001/api`
  : 'https://mentex-mkii.onrender.com/api';

export default function AdminApp() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  // For simplicity in this step, we'll fetch from the server REST API
  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch(`${API_URL}/quizzes`);
      const data = await res.json();
      setQuizzes(data);
    } catch (e) {
      console.error('Failed to fetch quizzes', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewQuizTitle('');
    setIsCreateModalOpen(true);
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;

    try {
      await fetch(`${API_URL}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newQuizTitle, description: 'Descrição...' })
      });
      setIsCreateModalOpen(false);
      setNewQuizTitle('');
      fetchQuizzes();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = (id: number) => {
    setQuizToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const deleteQuiz = async () => {
    if (quizToDelete === null) return;
    try {
      await fetch(`${API_URL}/quizzes/${quizToDelete}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setQuizToDelete(null);
      fetchQuizzes();
    } catch (e) {
      console.error(e);
    }
  };

  if (editingQuizId) {
    const quiz = quizzes.find(q => q.id === editingQuizId);
    if (quiz) {
      return (
        <QuizEditor 
          quiz={quiz} 
          onClose={() => setEditingQuizId(null)} 
          onSave={() => {
            setEditingQuizId(null);
            fetchQuizzes();
          }} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-indigo-400">MenteX <span className="text-white">Admin</span></h1>
            <p className="text-slate-400 mt-2">Gerencie seus quizzes e perguntas</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Novo Quiz
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500 transition-colors">
                <h3 className="text-2xl font-bold mb-2">{quiz.title}</h3>
                <p className="text-slate-400 mb-6">{quiz.questions?.length || 0} perguntas</p>
                
                <div className="flex gap-3">
                  <button onClick={() => setEditingQuizId(quiz.id)} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                    <Edit size={18} /> Editar
                  </button>
                  <button onClick={() => confirmDelete(quiz.id)} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
                <p className="text-slate-400 text-lg">Nenhum quiz encontrado.</p>
                <p className="text-slate-500">Crie seu primeiro quiz clicando no botão acima!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Modal for Create Quiz */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden">
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Nome do Quiz
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
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden p-6 text-center">
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
