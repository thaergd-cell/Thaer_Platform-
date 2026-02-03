
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ExamDetails, Question, ExamStyle } from '../types';
import AnswerSheet from './AnswerSheet';
import { FileText, CheckCircle } from 'lucide-react';

interface Props {
  id?: string;
  details: ExamDetails;
  questions: Question[];
  style: ExamStyle;
  versionLabel?: string;
  onPrint?: () => void;
}

const StudentAnswerTable: React.FC<{ questions: Question[] }> = ({ questions }) => {
    const mcqQuestions = questions.filter(q => q.visualType === 'multichoice' || q.visualType === 'truefalse');
    if (mcqQuestions.length === 0) return null;

    const questionsPerTable = 20;
    const chunks = Array.from({ length: Math.ceil(mcqQuestions.length / questionsPerTable) }, (_, i) =>
      mcqQuestions.slice(i * questionsPerTable, i * questionsPerTable + questionsPerTable)
    );
    
    const arLetters = ['أ', 'ب', 'ج', 'د', 'هـ'];

    return (
        <div className="answer-sheet-columns">
            {chunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex} className="answer-sheet-table-container">
                    <table className="w-full text-center border-2 border-black">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="p-2 w-1/5 border-r border-gray-400">#</th>
                                {arLetters.slice(0, 4).map(l => <th key={l} className="p-2 border-r border-gray-400">{l}</th>)}
                                {chunk.some(q => q.answers.length > 4) && <th className="p-2">هـ</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {chunk.map((q, index) => (
                                <tr key={q.id} className="border-t border-gray-400">
                                    <td className="font-bold border-r border-gray-400 p-2">{chunkIndex * questionsPerTable + index + 1}</td>
                                    {arLetters.map((_, letterIndex) => (
                                        <td key={letterIndex} className={`p-2 ${letterIndex < 4 ? 'border-r border-gray-400' : ''}`}>
                                            {letterIndex < q.answers.length && (
                                                <div className="w-5 h-5 border-2 border-black rounded-full mx-auto"></div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

const ExamPaper: React.FC<Props> = ({ id, details, questions, style, versionLabel }) => {
  const examRef = useRef<HTMLDivElement>(null);
  const [estimatedPages, setEstimatedPages] = useState(0);
  
  const totalMarks = useMemo(() => {
      return questions.reduce((sum, q) => sum + (q.mark || 0), 0);
  }, [questions]);

  const fontClass = useMemo(() => {
      switch(style?.fontFamily) {
          case 'Amiri': return 'font-amiri';
          case 'Cairo': return 'font-cairo';
          case 'IBM Plex Sans Arabic': return 'font-ibm';
          default: return 'font-tajawal';
      }
  }, [style?.fontFamily]);

  const textSizes = useMemo(() => {
      const base = style?.baseFontSize || 'base';
      if (base === 'sm') return { question: 'text-sm', answer: 'text-xs' };
      if (base === 'lg') return { question: 'text-lg', answer: 'text-base' };
      return { question: 'text-base', answer: 'text-sm' };
  }, [style?.baseFontSize]);

  const sectionOrder = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];

  const sectionInstructions = {
    'multichoice': 'اختر الإجابة الصحيحة فيما يلي، ثم انقل الإجابة إلى جدول الإجابات المخصص.',
    'shortanswer': 'أكمل الفراغات التالية بما يناسبها من معلومات صحيحة.',
    'essay': 'أجب عن الأسئلة التالية بوضوح وبخط يد مقروء في المساحات المخصصة.',
    'truefalse': 'ضع إشارة (✓) أمام العبارة الصحيحة وإشارة (✗) أمام العبارة الخاطئة فيما يلي:'
  };

  const processQuestionText = (text: string, type: string) => {
      if (type !== 'shortanswer') return text;
      return text.replace(/_+/g, (match) => {
          return `<span class="inline-block border-b border-gray-400 min-w-[20px] mx-1" style="width: ${match.length * 1.5}rem">&nbsp;</span>`;
      });
  };

  const questionGroups = useMemo(() => {
    if (!questions || questions.length === 0) return [];
    const groups: { type: string, layout: 'columns' | 'full', items: Question[] }[] = [];
    
    questions.forEach((q) => {
        let qType = (q.visualType || q.type) as string;
        if (q.answers && q.answers.length === 2 && qType === 'multichoice') {
            qType = 'truefalse';
        }
        
        const qLayout = q.layout || 'columns';
        let lastGroup = groups[groups.length - 1];
        if (!lastGroup || lastGroup.type !== qType) {
            groups.push({ type: qType, layout: qLayout, items: [q] });
        } else {
            lastGroup.items.push(q);
        }
    });
    return groups;
  }, [questions]);

  useEffect(() => {
    const calculatePages = () => {
      const mmToPx = 3.78; 
      const pageContentHeightPx = (297 - 15 * 2) * mmToPx; // A4 height minus top/bottom margins
      if (examRef.current) {
          const content = examRef.current.querySelector('.page-container');
          if (content) {
              setEstimatedPages(Math.ceil(content.scrollHeight / pageContentHeightPx));
          }
      }
    };
    const timer = setTimeout(calculatePages, 500);
    return () => clearTimeout(timer);
  }, [questions, details, style]);

  const renderQuestionItem = (q: Question, index: number, groupType: string) => {
    const qType = groupType;
    let answerGridClass = "flex flex-col gap-1";
    if (qType === 'multichoice') {
        if (style?.answerLayout === 'grid') answerGridClass = "grid grid-cols-2 gap-x-4 gap-y-1";
        else if (style?.answerLayout === 'auto') {
            const areAnswersShort = q.answers.every(a => a.text.replace(/<[^>]+>/g, '').trim().length < 40);
            if (areAnswersShort) answerGridClass = "grid grid-cols-2 gap-x-4 gap-y-1";
        }
    }

    const processedText = processQuestionText(q.text, qType);

    return (
      <div key={q.id} className={`question-item relative ${fontClass} block w-full clear-both mb-4 break-inside-avoid`}>
        <div className="flex gap-2">
          <span className={`font-bold ${textSizes.question} min-w-[1.2rem]`}>{index + 1}.</span>
          <div className="flex-grow w-full">
            <div className="mb-2 flex items-start gap-2">
                {qType === 'truefalse' && (
                    <span className="font-bold border-2 border-black px-2 py-0.5 rounded text-black">( &nbsp;&nbsp; )</span>
                )}
                <div className="flex-grow">
                    <div className={`prose prose-sm max-w-none font-medium leading-relaxed inline ${textSizes.question}`} style={{ color: style?.questionColor || '#000' }}>
                        <span dangerouslySetInnerHTML={{ __html: processedText }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 mx-2">({q.mark} علامة)</span>
                </div>
            </div>
            {qType === 'multichoice' && (
                <div className={answerGridClass}>
                    {q.answers.map((ans, ansIndex) => (
                        <div key={ans.id} className={`flex items-start gap-2 ${textSizes.answer}`}>
                            <span className="font-bold text-xs border px-1 rounded min-w-[1.2rem] text-center">{['أ', 'ب', 'ج', 'د', 'هـ'][ansIndex] || 'X'}</span>
                            <div className="pt-0.5 leading-snug" dangerouslySetInnerHTML={{ __html: ans.text }} />
                        </div>
                    ))}
                </div>
            )}
            {qType === 'essay' && (
                <div className="mt-4 space-y-4">
                    {Array.from({ length: q.essayLines || 3 }).map((_, i) => <div key={i} className="border-b border-dotted border-gray-400 h-6 w-full"></div>)}
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={examRef} className="print-area w-full">
      <div id="estimation-box" className="no-print no-export mb-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 shadow-sm transition-all">
        <div className="flex items-center gap-2">
          <FileText size={18} />
          <span className="font-bold">إجمالي الصفحات المتوقع:</span>
          <span className="bg-yellow-200 px-3 py-1 rounded-full text-yellow-900 font-bold">{estimatedPages}</span>
        </div>
        <div className="flex gap-6 font-bold text-xs">
             <div className="flex items-center gap-1"><CheckCircle size={14}/> مجموع العلامات: {totalMarks}</div>
        </div>
      </div>
      
      <div className="page-container paper-shadow bg-white text-black" dir={style.textDirection || 'rtl'}>
        {versionLabel && <div className="absolute top-4 left-4 border-2 border-black px-4 py-1 font-bold text-lg bg-white z-20 no-print">نموذج {versionLabel}</div>}

        <header className="exam-header border-b-2 border-black pb-4 mb-6 w-full block" style={{ color: style?.headerColor || '#000' }}>
          <div className="flex justify-between items-start mb-2 relative min-h-[80px]">
            <div className="w-1/3 z-10 text-right">
              <h3 className={`font-bold mb-1 ${style?.headerSizes?.university || 'text-xl'}`}>{details.university}</h3>
              <h4 className={`font-semibold opacity-90 ${style?.headerSizes?.college || 'text-lg'}`}>{details.college}</h4>
            </div>
            <div className="w-1/3 flex flex-col justify-center items-center absolute inset-0 m-auto">
              {details.logo && <img src={details.logo} alt="Logo" className="h-16 object-contain" />}
            </div>
            <div className="w-1/3 z-10 text-right">
              <h3 className={`font-bold mb-1 ${style?.headerSizes?.department || 'text-xl'}`}>{details.department}</h3>
              <h4 className={`font-semibold opacity-90 ${style?.headerSizes?.examName || 'text-lg'}`}>{details.examName} {versionLabel && ` - نموذج ${versionLabel}`}</h4>
            </div>
          </div>

          <div className="border border-black rounded p-3 bg-white text-black mt-2">
            <table className="w-full text-sm font-bold" style={{ tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td style={{ width: style.showStudentId ? '50%' : '100%', paddingLeft: '1rem' }}>اسم الطالب: ........................................</td>
                  {style.showStudentId && <td style={{ width: '50%'}}>الرقم الجامعي: ..................................</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </header>

        <main className="exam-body mt-4">
          {questionGroups.map((group, gIndex) => (
            <section key={`${group.type}-${gIndex}`} className="mb-6 break-inside-avoid">
              <h3 className="text-lg font-bold border-b-2 border-black pb-2 mb-4">
                {`السؤال ${sectionOrder[gIndex] || ''}: `}
                <span className="font-normal">{sectionInstructions[group.type as keyof typeof sectionInstructions]}</span>
              </h3>
              <div 
                className={`questions-container ${group.layout === 'columns' && style.columns === 2 ? 'columns-2 gap-x-8' : ''}`}
                style={{ columnRule: style.columns === 2 && style.showColumnDivider ? '1px solid #ccc' : 'none' }}
              >
                {group.items.map((q, qIndex) => renderQuestionItem(q, qIndex, group.type))}
              </div>
            </section>
          ))}
        </main>
      </div>
      
      {style.showStudentAnswerSheet && (
          <div className="student-answer-sheet-page force-page-break page-container paper-shadow bg-white text-black" dir={style.textDirection || 'rtl'}>
            <h2 className="text-center text-xl font-bold mb-6 border-b-2 border-black pb-2">ورقة الإجابات (خاص بالطالب)</h2>
            <StudentAnswerTable questions={questions} />
          </div>
      )}

      {style.showAnswerKey && (
          <div className="teacher-answer-sheet-page force-page-break page-container paper-shadow bg-white text-black" dir={style.textDirection || 'rtl'}>
            <h2 className="text-center text-xl font-bold mb-6 border-b-2 border-black pb-2">ورقة الإجابات (للمعلم)</h2>
            <AnswerSheet groupedQuestions={questionGroups} mode="teacher" />
          </div>
      )}
    </div>
  );
};

export default ExamPaper;
