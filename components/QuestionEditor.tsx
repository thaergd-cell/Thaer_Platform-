
import React, { useState, useEffect } from 'react';
import { Question, Answer, QuestionType } from '../types';
import { Shuffle, ListFilter, Edit2, Save, X, Hash, PlusCircle, Trash, AlignLeft, CheckSquare, Minus, Columns, Maximize, Layers, ArrowUpDown, Copy, Search, CheckCircle2, AlertCircle, Group, ListOrdered } from 'lucide-react';

interface Config {
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  groupByType: boolean;
  selectionMode: 'all' | 'manual';
  selectedIds: string[];
}

interface Props {
  allQuestions: Question[];
  setAllQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  onGenerateVersions?: (versionsConfig: { count: number, mcqCount: number, essayCount: number, shortCount: number }) => void;
  currentVersionLabel?: string;
}

const QuestionEditor: React.FC<Props> = ({ allQuestions, setAllQuestions, config, setConfig, onGenerateVersions, currentVersionLabel }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [versionCount, setVersionCount] = useState(1);
  const [mcqCount, setMcqCount] = useState(0);
  const [essayCount, setEssayCount] = useState(0);
  const [shortCount, setShortCount] = useState(0);

  useEffect(() => {
    const mcqs = allQuestions.filter(q => (q.visualType === 'multichoice' || q.type === 'multichoice' || q.type === 'truefalse')).length;
    const essays = allQuestions.filter(q => (q.visualType === 'essay' || q.type === 'essay')).length;
    const shorts = allQuestions.filter(q => (q.visualType === 'shortanswer' || q.type === 'shortanswer' || q.type === 'numerical')).length;

    setMcqCount(mcqs);
    setEssayCount(essays);
    setShortCount(shorts);
  }, [allQuestions]);

  const [qType, setQType] = useState<QuestionType>('multichoice');
  const [newQuestion, setNewQuestion] = useState({ text: '', mark: 1, answers: ['', '', '', ''], correctAnswerIndex: 0, essayLines: 3, correctText: '', layout: 'columns' });

  // Action Logic
  const shuffleQuestionsAction = () => {
    if (allQuestions.length === 0) return;
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setAllQuestions(shuffled);
  };

  const shuffleAnswersAction = () => {
    const updated = allQuestions.map(q => {
      if (q.visualType === 'multichoice' || q.type === 'multichoice') {
        return {
          ...q,
          answers: [...q.answers].sort(() => Math.random() - 0.5)
        };
      }
      return q;
    });
    setAllQuestions(updated);
  };

  const groupByTypeAction = () => {
    const order = { 'multichoice': 1, 'truefalse': 1, 'shortanswer': 2, 'essay': 3 };
    const sorted = [...allQuestions].sort((a, b) => {
      const typeA = (a.visualType || a.type) as keyof typeof order;
      const typeB = (b.visualType || b.type) as keyof typeof order;
      return (order[typeA] || 9) - (order[typeB] || 9);
    });
    setAllQuestions(sorted);
  };

  const triggerVersionGeneration = () => {
      if ((mcqCount + essayCount + shortCount) === 0) return alert("الرجاء تحديد عدد الأسئلة.");
      if (onGenerateVersions) onGenerateVersions({ count: versionCount, mcqCount, essayCount, shortCount });
  };

  const startEditing = (q: Question) => {
      setEditForm({ ...q });
      setEditingId(q.id);
  };

  const saveEdit = () => {
      if (!editForm || !editingId) return;
      setAllQuestions(prev => prev.map(q => q.id === editingId ? (editForm as Question) : q));
      setEditingId(null);
      setEditForm(null);
  };

  const deleteQuestion = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
          setAllQuestions(prev => prev.filter(q => q.id !== id));
      }
  };

  const addManualQuestion = () => {
      if (!newQuestion.text.trim()) return alert('الرجاء إدخال نص السؤال');
      let answers: Answer[] = [];
      let visualType: QuestionType = qType;
      
      if (qType === 'multichoice') {
          answers = newQuestion.answers.filter(a => a.trim() !== '').map((text, idx) => ({ id: `new_a_${Date.now()}_${idx}`, text, fraction: idx === newQuestion.correctAnswerIndex ? 100 : 0 }));
          if (answers.length < 2) return alert('الرجاء إضافة إجابتين على الأقل');
      } else {
          answers = [{ id: 'ans1', text: newQuestion.correctText, fraction: 100 }];
      }

      const q: Question = { id: `manual_${Date.now()}`, name: `سؤال يدوي`, text: newQuestion.text, type: qType, visualType, layout: qType === 'multichoice' ? 'columns' : 'full', mark: newQuestion.mark, answers, essayLines: newQuestion.essayLines, correctAnswerText: newQuestion.correctText };
      setAllQuestions([...allQuestions, q]);
      setNewQuestion({ text: '', mark: 1, answers: ['', '', '', ''], correctAnswerIndex: 0, essayLines: 3, correctText: '', layout: 'columns' });
      setShowAddForm(false);
  };

  const filteredQuestions = allQuestions.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8 no-print">
      {/* Header Toolbar */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <ListFilter size={20} className="text-blue-600" />
          إدارة بنك الأسئلة ({allQuestions.length})
        </h3>
        
        <div className="flex items-center gap-2 flex-grow max-w-md">
            <div className="relative flex-grow">
                <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
                <input type="text" placeholder="بحث سريع..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition hover:bg-blue-700 shadow-sm"><PlusCircle size={16} /> إضافة سؤال</button>
        </div>
      </div>

      {/* Quick Actions Toolbar */}
      {allQuestions.length > 0 && (
        <div className="bg-blue-50/50 p-3 border-b border-blue-100 flex flex-wrap gap-2">
           <button 
              onClick={shuffleQuestionsAction} 
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm"
              title="تغيير ترتيب الأسئلة عشوائياً"
            >
             <Shuffle size={14} /> خلط الأسئلة
           </button>
           <button 
              onClick={shuffleAnswersAction} 
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm"
              title="تغيير ترتيب خيارات أسئلة الـ MCQ"
            >
             <ListOrdered size={14} /> خلط الإجابات
           </button>
           <button 
              onClick={groupByTypeAction} 
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm"
              title="ترتيب الأسئلة: موضوعي -> أكمل -> مقالي"
            >
             <Group size={14} /> ترتيب حسب النوع
           </button>
        </div>
      )}

      {/* Add/Edit Overlays */}
      {(showAddForm || (editingId && editForm)) && (
          <div className="fixed inset-0 bg-black/60 z-[10001] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                      <h4 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                          {editingId ? <Edit2 className="text-orange-500" /> : <PlusCircle className="text-blue-500" />}
                          {editingId ? 'تعديل السؤال الحالي' : 'إضافة سؤال جديد لبنك الأسئلة'}
                      </h4>
                      <button onClick={() => { setEditingId(null); setEditForm(null); setShowAddForm(false); }} className="text-gray-400 hover:text-red-600 transition"><X size={28} /></button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-3">
                              <label className="block text-sm font-bold text-gray-600 mb-1">نص السؤال</label>
                              <textarea 
                                value={editingId ? editForm?.text : newQuestion.text} 
                                onChange={e => editingId ? setEditForm({...editForm, text: e.target.value}) : setNewQuestion({...newQuestion, text: e.target.value})}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32" 
                                placeholder="اكتب السؤال هنا..." 
                              />
                          </div>
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-sm font-bold text-gray-600 mb-1">العلامة</label>
                                  <input 
                                    type="number" 
                                    value={editingId ? editForm?.mark : newQuestion.mark} 
                                    onChange={e => {
                                        const v = parseFloat(e.target.value);
                                        editingId ? setEditForm({...editForm, mark: v}) : setNewQuestion({...newQuestion, mark: v});
                                    }} 
                                    className="w-full p-2 border rounded-lg font-bold text-center text-lg" 
                                  />
                              </div>
                              {!editingId && (
                                  <div>
                                      <label className="block text-sm font-bold text-gray-600 mb-1">النوع</label>
                                      <select value={qType} onChange={e => setQType(e.target.value as any)} className="w-full p-2 border rounded-lg text-sm bg-gray-50">
                                          <option value="multichoice">اختيار من متعدد</option>
                                          <option value="shortanswer">أكمل فراغ</option>
                                          <option value="essay">مقالي / شرح</option>
                                      </select>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Options for MCQ */}
                      {((editingId && editForm?.visualType === 'multichoice') || (!editingId && qType === 'multichoice')) && (
                          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border">
                              <label className="block text-sm font-bold text-gray-700 mb-2">الخيارات المتاحة (حدد الإجابة الصحيحة)</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {(editingId ? editForm?.answers : newQuestion.answers.map((a,i)=>({id:i, text:a, fraction: i === newQuestion.correctAnswerIndex ? 100 : 0})))?.map((ans: any, idx: number) => (
                                      <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm">
                                          <button 
                                            onClick={() => {
                                                if (editingId && editForm) {
                                                    const newAns = editForm.answers?.map((a, i) => ({ ...a, fraction: i === idx ? 100 : 0 }));
                                                    setEditForm({...editForm, answers: newAns});
                                                } else {
                                                    setNewQuestion({...newQuestion, correctAnswerIndex: idx});
                                                }
                                            }}
                                            className={`p-2 rounded-full transition ${ans.fraction === 100 || (!editingId && newQuestion.correctAnswerIndex === idx) ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}
                                          >
                                              <CheckCircle2 size={18} />
                                          </button>
                                          <input 
                                            value={typeof ans === 'string' ? ans : ans.text} 
                                            onChange={e => {
                                                if (editingId && editForm) {
                                                    const newAns = [...(editForm.answers || [])];
                                                    newAns[idx] = { ...newAns[idx], text: e.target.value };
                                                    setEditForm({...editForm, answers: newAns});
                                                } else {
                                                    const a = [...newQuestion.answers]; a[idx] = e.target.value;
                                                    setNewQuestion({...newQuestion, answers: a});
                                                }
                                            }}
                                            className="flex-grow p-1 text-sm outline-none"
                                            placeholder={`خيار ${idx + 1}`}
                                          />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* Correct Text for non-MCQ */}
                      {((editingId && editForm?.visualType !== 'multichoice') || (!editingId && qType !== 'multichoice')) && (
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                              <label className="block text-sm font-bold text-blue-800 mb-2">الإجابة النموذجية (تظهر للمصحح فقط)</label>
                              <textarea 
                                value={editingId ? editForm?.correctAnswerText : newQuestion.correctText} 
                                onChange={e => editingId ? setEditForm({...editForm, correctAnswerText: e.target.value}) : setNewQuestion({...newQuestion, correctText: e.target.value})}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                rows={3}
                                placeholder="اكتب الإجابة الصحيحة هنا..."
                              />
                          </div>
                      )}
                  </div>

                  <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                      <button onClick={() => { setEditingId(null); setEditForm(null); setShowAddForm(false); }} className="px-6 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 font-bold">إلغاء</button>
                      <button 
                        onClick={editingId ? saveEdit : addManualQuestion} 
                        className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition transform hover:scale-105"
                      >
                          {editingId ? 'تحديث السؤال' : 'إضافة السؤال الآن'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Generation Controls */}
      {onGenerateVersions && allQuestions.length > 0 && (
          <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><label className="text-xs font-bold text-indigo-900">النماذج:</label><input type="number" value={versionCount} onChange={e => setVersionCount(Math.max(1, parseInt(e.target.value)))} className="w-16 p-2 border rounded-lg text-center font-bold" /></div>
              <div className="flex flex-wrap gap-4 items-center">
                  <div className="text-xs font-bold">توزيع الأسئلة:</div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border"><span className="text-[10px] text-gray-400">MCQ:</span><input type="number" value={mcqCount} onChange={e => setMcqCount(parseInt(e.target.value))} className="w-12 text-center text-sm font-bold" /></div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border"><span className="text-[10px] text-gray-400">مقالي:</span><input type="number" value={essayCount} onChange={e => setEssayCount(parseInt(e.target.value))} className="w-12 text-center text-sm font-bold" /></div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border"><span className="text-[10px] text-gray-400">أكمل:</span><input type="number" value={shortCount} onChange={e => setShortCount(parseInt(e.target.value))} className="w-12 text-center text-sm font-bold" /></div>
              </div>
              <button onClick={triggerVersionGeneration} className="bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-800 transition flex items-center gap-2 shadow-md"><Shuffle size={18}/> توليد النماذج</button>
          </div>
      )}

      {/* List Area */}
      <div className="max-h-[500px] overflow-y-auto bg-white">
          {filteredQuestions.length === 0 ? (
              <div className="p-16 text-center text-gray-400 flex flex-col items-center gap-2 italic">
                  <AlertCircle size={40} className="text-gray-200" />
                  لا توجد أسئلة مضافة حالياً. قم بالرفع أو الإضافة اليدوية.
              </div>
          ) : (
              <div className="divide-y divide-gray-100">
                  {filteredQuestions.map((q, idx) => (
                      <div key={q.id} className="p-4 hover:bg-gray-50/80 transition group flex gap-4 items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                          <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start gap-4">
                                  <div className="min-w-0 flex-grow">
                                      <div className="text-sm font-bold text-gray-800 mb-1" dangerouslySetInnerHTML={{ __html: q.text }}></div>
                                      <div className="flex gap-4">
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase">{q.visualType || 'عام'}</span>
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">العلامة: {q.mark}</span>
                                      </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                      <button onClick={() => startEditing(q)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="تعديل"><Edit2 size={18}/></button>
                                      <button onClick={(e) => deleteQuestion(q.id, e)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition" title="حذف"><Trash size={18}/></button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};

export default QuestionEditor;
