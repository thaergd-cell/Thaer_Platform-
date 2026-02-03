
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, FileText, Activity, AlertCircle, Save, ArrowRight, RefreshCw, Home, LogOut } from 'lucide-react';
import { analyzeAnswerKey, analyzeStudentSheet } from '../services/geminiService';
import { OmrAnswers, StudentOmrResult } from '../types';
import { logoutUser } from '../utils/storage';

const OmrGrader: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Key
  const [keyImage, setKeyImage] = useState<string | null>(null);
  const [keyAnswers, setKeyAnswers] = useState<OmrAnswers>({});

  // Step 2: Students
  const [studentResults, setStudentResults] = useState<StudentOmrResult[]>([]);
  const [processingCount, setProcessingCount] = useState(0);

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const handleKeyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setKeyImage(base64);
      setIsLoading(true);
      setError(null);
      try {
        const detected = await analyzeAnswerKey(base64);
        setKeyAnswers(detected);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateKeyAnswer = (qNum: string, val: string) => {
    const newKeys = { ...keyAnswers };
    if (!val) delete newKeys[qNum];
    else newKeys[qNum] = val.toUpperCase();
    setKeyAnswers(newKeys);
  };

  const confirmKey = () => {
    if (Object.keys(keyAnswers).length === 0) return alert("الرجاء تحديد الإجابات الصحيحة أولاً");
    setStep(2);
  };

  const handleStudentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setProcessingCount(0);
    const total = files.length;
    const results: StudentOmrResult[] = [];

    for (let i = 0; i < total; i++) {
        setProcessingCount(i + 1);
        const file = files[i];
        
        try {
            const base64 = await new Promise<string>((resolve) => {
                const r = new FileReader();
                r.onload = (ev) => resolve(ev.target?.result as string);
                r.readAsDataURL(file);
            });

            const analysis = await analyzeStudentSheet(base64);
            
            // Calculate Score
            let score = 0;
            const details = [];
            const totalQ = Object.keys(keyAnswers).length;

            for (const [qNum, correctAns] of Object.entries(keyAnswers)) {
                const studentAns = analysis.answers[qNum] || '-';
                const isCorrect = studentAns === correctAns;
                if (isCorrect) score++;
                details.push({ qNum, studentAns, correctAns, isCorrect });
            }

            results.push({
                id: `st_${Date.now()}_${i}`,
                imageName: file.name,
                studentName: analysis.studentName,
                studentId: analysis.studentId,
                answers: analysis.answers,
                score,
                totalQuestions: totalQ,
                details
            });

        } catch (err) {
            console.error(`Error processing ${file.name}`, err);
        }
    }

    setStudentResults(prev => [...prev, ...results]);
    setIsLoading(false);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-tajawal flex flex-col">
       <nav className="bg-indigo-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Activity size={28} className="text-green-400" />
             <h1 className="text-xl font-bold">نظام التصحيح الآلي (OMR)</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/exam-generator" className="flex items-center gap-2 hover:text-indigo-200 transition text-sm">إعداد الامتحانات</Link>
            <Link to="/" className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition text-sm"><Home size={16} /> الرئيسية</Link>
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition text-sm"><LogOut size={16} /> خروج</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 max-w-5xl flex-grow">
        
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-8 px-8">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 1 ? 'bg-indigo-100 border-2 border-indigo-600' : 'bg-gray-100 border-2 border-gray-300'}`}>1</div>
                <span className="text-sm font-bold">نموذج الإجابة</span>
            </div>
            <div className={`flex-grow h-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 2 ? 'bg-indigo-100 border-2 border-indigo-600' : 'bg-gray-100 border-2 border-gray-300'}`}>2</div>
                <span className="text-sm font-bold">رفع الأوراق</span>
            </div>
            <div className={`flex-grow h-1 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${step >= 3 ? 'bg-indigo-100 border-2 border-indigo-600' : 'bg-gray-100 border-2 border-gray-300'}`}>3</div>
                <span className="text-sm font-bold">النتائج</span>
            </div>
        </div>

        {/* STEP 1: ANSWER KEY */}
        {step === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-indigo-600" />
                    تحميل نموذج الإجابة (المفتاح)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                             <input type="file" onChange={handleKeyUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                             {keyImage ? (
                                 <img src={keyImage} alt="Key" className="max-h-64 mx-auto rounded shadow" />
                             ) : (
                                 <div className="py-8">
                                     <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                                     <p className="text-gray-500 font-bold">اضغط هنا لرفع صورة ورقة الإجابة النموذجية</p>
                                     <p className="text-xs text-gray-400 mt-2">JPEG, PNG</p>
                                 </div>
                             )}
                        </div>
                        {isLoading && <div className="mt-4 text-center text-indigo-600 font-bold animate-pulse">جاري تحليل الصورة...</div>}
                        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded flex items-center gap-2"><AlertCircle size={20}/> {error}</div>}
                    </div>

                    <div>
                        <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col">
                            <h3 className="font-bold text-gray-700 mb-3 border-b pb-2">الإجابات المكتشفة</h3>
                            {Object.keys(keyAnswers).length > 0 ? (
                                <div className="flex-grow overflow-y-auto max-h-[400px]">
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(keyAnswers).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([q, ans]) => (
                                            <div key={q} className="flex items-center gap-1 bg-white p-2 rounded border shadow-sm">
                                                <span className="text-xs font-bold text-gray-500 w-6">{q}</span>
                                                <input 
                                                    type="text" 
                                                    value={ans} 
                                                    onChange={(e) => updateKeyAnswer(q, e.target.value)}
                                                    className="w-10 text-center font-bold text-indigo-700 border-b border-indigo-200 focus:outline-none focus:border-indigo-600"
                                                    maxLength={1}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">
                                    بانتظار تحليل الصورة...
                                </div>
                            )}
                            
                            <div className="mt-4 pt-4 border-t">
                                <button 
                                    onClick={confirmKey}
                                    disabled={Object.keys(keyAnswers).length === 0}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    التالي: تصحيح الأوراق <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: UPLOAD STUDENTS */}
        {step === 2 && (
             <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto text-center">
                 {isLoading ? (
                     <div className="py-12">
                         <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                         <h3 className="text-xl font-bold text-gray-800">جاري تصحيح الأوراق...</h3>
                         <p className="text-gray-500 mt-2">تمت معالجة {processingCount} ورقة</p>
                     </div>
                 ) : (
                     <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">رفع أوراق الطلاب</h2>
                        <p className="text-gray-600 mb-8">قم بتحديد جميع صور أوراق إجابات الطلاب لبدء عملية التصحيح الآلي.</p>
                        
                        <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-xl p-12 hover:bg-indigo-100 transition cursor-pointer relative group">
                            <input 
                                type="file" 
                                multiple 
                                onChange={handleStudentUpload} 
                                accept="image/*" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            />
                            <div className="group-hover:scale-105 transition transform duration-300">
                                <Upload size={64} className="mx-auto text-indigo-500 mb-4" />
                                <span className="block text-xl font-bold text-indigo-800">اضغط لرفع الصور</span>
                                <span className="text-sm text-indigo-400">يمكنك اختيار ملفات متعددة</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700 px-4">رجوع</button>
                        </div>
                     </>
                 )}
             </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle className="text-green-600" /> نتائج التصحيح ({studentResults.length})
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm font-bold">
                             طباعة التقرير
                        </button>
                        <button onClick={() => { setStep(2); setStudentResults([]); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-sm font-bold">
                            <RefreshCw size={16} /> تصحيح المزيد
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                            <tr>
                                <th className="p-4">اسم الطالب / الصورة</th>
                                <th className="p-4">الرقم الجامعي</th>
                                <th className="p-4 text-center">النتيجة</th>
                                <th className="p-4 text-center">النسبة المئوية</th>
                                <th className="p-4">حالة النجاح</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {studentResults.map((result) => {
                                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                                const isPass = percentage >= 50;
                                return (
                                    <tr key={result.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900">{result.studentName !== 'Unknown' ? result.studentName : result.imageName}</div>
                                            <div className="text-xs text-gray-400">{result.imageName}</div>
                                        </td>
                                        <td className="p-4 font-mono text-gray-600">{result.studentId || '-'}</td>
                                        <td className="p-4 text-center font-bold text-lg">
                                            {result.score} / {result.totalQuestions}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${percentage >= 90 ? 'bg-green-100 text-green-800' : (percentage >= 50 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800')}`}>
                                                %{percentage}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {isPass ? <span className="text-green-600 font-bold">ناجح</span> : <span className="text-red-600 font-bold">راسب</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {studentResults.length === 0 && (
                    <div className="p-8 text-center text-gray-500">لا توجد نتائج لعرضها</div>
                )}
            </div>
        )}

      </main>
    </div>
  );
};

export default OmrGrader;
