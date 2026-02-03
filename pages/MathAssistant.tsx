
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut, Sigma, FileText, PlusCircle, Trash, Edit3, ClipboardCopy, Download, Loader2 } from 'lucide-react';
import { logoutUser } from '../utils/storage';

declare var html2canvas: any;

interface MathQuestion {
  id: string;
  text: string;
  mark: number;
}

const MathAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'equations' | 'exambuilder'>('equations');
  const [equation, setEquation] = useState('');
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [currentMark, setCurrentMark] = useState(1);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1200; canvas.height = 300;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.fillText(equation || 'المعادلة ستظهر هنا', canvas.width / 2, canvas.height / 2);
  };

  useEffect(() => {
    if (activeTab === 'equations') draw();
  }, [equation, activeTab]);

  const handleSaveAsImage = async () => {
    const paperElement = document.getElementById('exam-paper');
    if (!paperElement || questions.length === 0) return;

    setIsSavingImage(true);
    try {
      const canvas = await html2canvas(paperElement, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
          const paper = clonedDoc.getElementById('exam-paper');
          if (paper) {
            paper.style.boxShadow = 'none';
          }
          clonedDoc.querySelectorAll('.no-print').forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        }
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'math_worksheet.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('حدث خطأ أثناء حفظ الصورة.');
    } finally {
      setIsSavingImage(false);
    }
  };
  
  const handleSaveAsWord = () => {
    if (questions.length === 0) return;

    let contentHtml = `
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="font-family: Arial, sans-serif; font-size: 22px; font-weight: bold;">ورقة عمل مادة الرياضيات</h2>
        </div>
        <div style="font-family: Arial, sans-serif; font-size: 16px;">
    `;

    questions.forEach((q, i) => {
        contentHtml += `
            <div style="margin-bottom: 20px;">
                <p style="font-weight: bold; display: flex; justify-content: space-between;">
                    <span>${i + 1}. ${q.text}</span>
                    <span style="font-weight: normal; font-size: 14px;">(${q.mark} علامة)</span>
                </p>
            </div>
        `;
    });

    contentHtml += `</div>`;
    
    const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <title>Math Worksheet</title>
            <!--[if gte mso 9]>
            <xml>
                <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>90</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
                </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                body { direction: rtl; text-align: right; font-family: 'Times New Roman', serif; }
            </style>
        </head>
        <body>
    `;
    const footer = `</body></html>`;

    const sourceHTML = header + contentHtml + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'math_worksheet.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
};


  const addOrUpdate = () => {
    if (!currentText.trim()) return;
    if (editingId) {
      setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, text: currentText, mark: currentMark } : q));
      setEditingId(null);
    } else {
      setQuestions(prev => [...prev, { id: Date.now().toString(), text: currentText, mark: currentMark }]);
    }
    setCurrentText('');
    setCurrentMark(1);
  };

  const removeQuestion = (id: string) => {
    if (window.confirm('حذف هذا السؤال؟')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const clearAll = () => {
    if (window.confirm('مسح الورقة بالكامل؟')) setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-tajawal">
       <nav className="bg-orange-600 text-white p-4 flex justify-between items-center no-print">
          <div className="flex items-center gap-2 font-bold"><Sigma /> مساعد الرياضيات</div>
          <div className="flex gap-4">
            <Link to="/" className="hover:underline">الرئيسية</Link>
            <button onClick={handleLogout}>خروج</button>
          </div>
       </nav>

       <main className="container mx-auto p-4 md:p-8">
          <div className="flex gap-4 mb-6 no-print">
             <button onClick={() => setActiveTab('equations')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'equations' ? 'bg-orange-600 text-white shadow-md' : 'bg-white border'}`}>منشئ المعادلات</button>
             <button onClick={() => setActiveTab('exambuilder')} className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'exambuilder' ? 'bg-orange-600 text-white shadow-md' : 'bg-white border'}`}>منشئ الامتحانات</button>
          </div>

          {activeTab === 'equations' && (
             <div className="bg-white p-8 rounded-xl shadow-lg border space-y-4 no-print">
                <textarea value={equation} onChange={(e) => setEquation(e.target.value)} className="w-full p-4 border rounded-xl text-2xl h-32 text-center" placeholder="اكتب المعادلة الرياضية هنا..." />
                <div className="p-10 bg-gray-50 border-2 border-dashed rounded-xl flex flex-col items-center">
                   <canvas ref={canvasRef} className="max-w-full bg-white shadow-sm border" />
                   <div className="flex gap-4 mt-6">
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><ClipboardCopy size={18}/> نسخ</button>
                      <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Download size={18}/> حفظ</button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'exambuilder' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4 no-print">
                   <div className="bg-white p-6 rounded-xl shadow border">
                      <h3 className="font-bold text-orange-600 mb-4 border-b pb-2">{editingId ? 'تعديل السؤال' : 'إضافة سؤال'}</h3>
                      <textarea value={currentText} onChange={e => setCurrentText(e.target.value)} className="w-full p-3 border rounded-xl mb-3 h-32" placeholder="نص السؤال الرياضي..." />
                      <div className="flex gap-2 mb-4">
                         <input type="number" value={currentMark} onChange={e => setCurrentMark(parseInt(e.target.value))} className="w-20 p-2 border rounded" placeholder="علامة" />
                         <span className="self-center text-sm">درجة</span>
                      </div>
                      <button onClick={addOrUpdate} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                         <PlusCircle size={20}/> {editingId ? 'حفظ التعديلات' : 'إضافة للورقة'}
                      </button>
                   </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                   <div className="bg-white p-4 rounded-xl shadow border flex justify-between items-center no-print">
                      <span className="font-bold">معاينة ورقة العمل</span>
                      <div className="flex gap-2">
                         <button onClick={clearAll} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold border border-red-200">مسح الورقة</button>
                         <button 
                            onClick={handleSaveAsImage} 
                            disabled={isSavingImage || questions.length === 0}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSavingImage ? <Loader2 size={18} className="animate-spin"/> : <Download size={18}/>}
                            {isSavingImage ? 'جاري الحفظ...' : 'حفظ كصورة'}
                         </button>
                         <button 
                            onClick={handleSaveAsWord} 
                            disabled={questions.length === 0}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FileText size={18}/> حفظ كملف وورد
                         </button>
                      </div>
                   </div>

                   <div id="exam-paper" className="bg-white p-[20mm] shadow-2xl min-h-[297mm] mx-auto" style={{ width: '210mm' }} dir="rtl">
                      <div className="text-center border-b-2 border-black pb-4 mb-8">
                         <h2 className="text-2xl font-bold">ورقة عمل مادة الرياضيات</h2>
                      </div>
                      <div className="space-y-6">
                         {questions.map((q, i) => (
                            <div key={q.id} className="relative group border-b border-gray-100 pb-4">
                               <div className="flex justify-between font-bold text-lg">
                                  <span>{i + 1}. {q.text}</span>
                                  <span className="text-sm">({q.mark} علامة)</span>
                               </div>
                               <div className="absolute right-[-40px] top-0 no-print flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => { setEditingId(q.id); setCurrentText(q.text); setCurrentMark(q.mark); }} className="p-1 text-blue-600"><Edit3 size={16}/></button>
                                  <button onClick={() => removeQuestion(q.id)} className="p-1 text-red-600"><Trash size={16}/></button>
                               </div>
                            </div>
                         ))}
                         {questions.length === 0 && <p className="text-center text-gray-400 py-20 italic border-2 border-dashed rounded-xl">لا توجد أسئلة مضافة حتى الآن...</p>}
                      </div>
                   </div>
                </div>
             </div>
          )}
       </main>
    </div>
  );
};

export default MathAssistant;
