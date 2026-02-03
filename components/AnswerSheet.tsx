
import React from 'react';
import { Question } from '../types';

type QuestionWithIndex = Question & { displayIndex?: number };

interface Props {
  questions?: QuestionWithIndex[];
  groupedQuestions?: { type: string, items: Question[] }[];
  mode: 'student' | 'teacher';
}

const AnswerSheet: React.FC<Props> = ({ questions, groupedQuestions, mode }) => {
  const arLetters = ['أ', 'ب', 'ج', 'د', 'هـ'];

  const flatQuestionsForDisplay = React.useMemo(() => {
    if (mode === 'student' && questions) return questions;
    
    if (mode === 'teacher' && groupedQuestions) {
      const all: (Question & { displayIndex: number, sectionLabel: string })[] = [];
      const sectionOrder = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
      
      groupedQuestions.forEach((group, gIdx) => {
        group.items.forEach((q, qIdx) => {
          all.push({
            ...q,
            displayIndex: qIdx + 1,
            sectionLabel: sectionOrder[gIdx] || 'التالي'
          });
        });
      });
      return all;
    }
    return questions || [];
  }, [questions, groupedQuestions, mode]);

  if (flatQuestionsForDisplay.length === 0) return null;

  return (
    <div className="w-full">
      <div className="teacher-answer-sheet-grid">
        {flatQuestionsForDisplay.map((q: any, idx) => {
            const displayIndex = q.displayIndex || (idx + 1);
            const qType = q.visualType || q.type;
            const correctIndex = q.answers.findIndex((a: any) => a.fraction === 100);
            const isTF = q.answers.length === 2 || qType === 'truefalse';

            return (
                <div key={q.id} className="answer-sheet-item">
                    <div className="flex items-center">
                        <div className="w-12 flex flex-col items-center border-l border-gray-300 ml-2">
                            <span className="font-bold text-xs">{displayIndex}</span>
                            {mode === 'teacher' && q.sectionLabel && (
                                <span className="text-[7px] text-gray-400 font-bold whitespace-nowrap">س {q.sectionLabel}</span>
                            )}
                        </div>
                        <div className="flex-grow flex justify-center px-1">
                            {mode === 'teacher' && isTF ? (
                                <div className="font-bold text-base">
                                    {correctIndex === 0 ? (
                                        <span className="text-green-600">✓</span>
                                    ) : (
                                        <span className="text-red-600">✗</span>
                                    )}
                                </div>
                            ) : qType === 'multichoice' ? (
                                <div className="flex justify-center items-center gap-2 w-full max-w-[150px]">
                                    {arLetters.slice(0, q.answers.length).map((letter, optIdx) => {
                                        const isCorrect = mode === 'teacher' && optIdx === correctIndex;
                                        return (
                                            <div key={optIdx} className={`w-5 h-5 rounded-full border border-black flex items-center justify-center font-bold text-xs ${isCorrect ? 'bg-black text-white' : 'bg-white'}`}>
                                                {isCorrect ? '✓' : letter}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="w-full text-right text-xs">
                                    {mode === 'teacher' ? (
                                        <span className="printable-long-text font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded">
                                            {q.correctAnswerText || q.answers[0]?.text || '---'}
                                        </span>
                                    ) : (
                                        <div className="w-full h-4 border-b border-dotted border-gray-400"></div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default AnswerSheet;