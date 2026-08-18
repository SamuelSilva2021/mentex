import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface Question {
  id?: number;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
}

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:3001/api`
  : 'https://mentex-mkii.onrender.com/api';

export default function QuizEditor({ 
  quiz, 
  token,
  onClose, 
  onSave 
}: { 
  quiz: any; 
  token?: string;
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    quiz.questions?.length > 0 
      ? quiz.questions 
      : []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/quizzes/${quiz.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title, description, questions })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${res.status}`);
      }

      onSave(); // notify parent to refresh and close
    } catch (e: any) {
      console.error('Erro ao salvar quiz:', e);
      alert(`Erro ao salvar quiz: ${e.message || 'Verifique sua conexão.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions, 
      { text: '', options: ['', '', '', ''], correctIndex: 0, timeLimit: 20 }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" /> Voltar
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs sm:text-sm md:text-base transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Save size={18} className="sm:w-5 sm:h-5" /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>

        <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700 mb-6 sm:mb-8 shadow-lg">
          <label className="block text-xs sm:text-sm font-medium text-slate-400 mb-1.5 sm:mb-2">Título do Quiz</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-white text-base sm:text-xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all mb-4"
          />
          <label className="block text-sm font-medium text-slate-400 mb-2">Descrição do Quiz</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            placeholder="Digite uma descrição para o quiz..."
          />
        </div>

        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-300">Pergunta {qIndex + 1}</h3>
                <button 
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Digite a pergunta aqui..."
                  value={q.text}
                  onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-xl border ${q.correctIndex === optIndex ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-900'}`}>
                    <input 
                      type="radio" 
                      name={`correct-${qIndex}`} 
                      checked={q.correctIndex === optIndex}
                      onChange={() => updateQuestion(qIndex, 'correctIndex', optIndex)}
                      className="w-5 h-5 accent-green-500"
                    />
                    <input
                      type="text"
                      placeholder={`Opção ${optIndex + 1}`}
                      value={opt}
                      onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                      className="w-full bg-transparent border-none text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 border-t border-slate-700 pt-4 mt-4">
                <label className="text-slate-400 text-sm">Tempo Limite (segundos):</label>
                <select 
                  value={q.timeLimit}
                  onChange={e => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={10}>10s</option>
                  <option value={20}>20s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={addQuestion}
          className="w-full mt-6 bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:border-indigo-500 hover:text-indigo-400"
        >
          <Plus size={24} /> Adicionar Pergunta
        </button>
      </div>
    </div>
  );
}
