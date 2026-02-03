
import * as mammoth from 'mammoth';
import { Question, Answer, ParsedExam, QuestionType } from '../types';

const arabicNumeralsMap: { [key: string]: string } = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

const convertArabicNumerals = (str: string): string => {
  if (!str) return str;
  return str.replace(/[٠-٩]/g, d => arabicNumeralsMap[d]);
};

export const parseWordDoc = async (arrayBuffer: ArrayBuffer): Promise<ParsedExam> => {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    const htmlContent = result.value;
    
    if (!htmlContent) {
        return { questions: [], error: "الملف فارغ أو لا يمكن قراءته." };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const questions: Question[] = [];
    const elements = Array.from(doc.body.children);
    let qIndex = 0;

    for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const tagName = el.tagName.toUpperCase();
        let textContent = el.textContent?.trim() || '';
        
        if (!textContent) continue;

        if (tagName === 'UL' || tagName === 'OL') {
            const questionItems = el.querySelectorAll(':scope > li');
            questionItems.forEach((qItem) => {
                const nestedList = qItem.querySelector('ul, ol');
                const clone = qItem.cloneNode(true) as HTMLElement;
                const nestedInClone = clone.querySelector('ul, ol');
                if (nestedInClone) nestedInClone.remove();
                
                const questionText = clone.innerHTML.trim();
                if (!questionText) return;

                const answers: Answer[] = [];
                if (nestedList) {
                    const answerItems = nestedList.querySelectorAll(':scope > li');
                    answerItems.forEach((aItem, aIdx) => {
                        const html = aItem.innerHTML;
                        const isBold = aItem.querySelector('strong, b') !== null || html.includes('<strong>') || html.includes('<b>');
                        const cleanText = html.replace(/<\/?(strong|b)[^>]*>/gi, "").trim();
                        answers.push({ id: `doc_q${qIndex}_a${aIdx}`, text: cleanText, fraction: isBold ? 100 : 0 });
                    });
                }

                if (answers.length > 0) {
                    questions.push({
                        id: `doc_q_${Date.now()}_${qIndex}`,
                        name: `سؤال ${qIndex + 1}`,
                        text: questionText,
                        type: 'multichoice',
                        visualType: 'multichoice', 
                        layout: 'columns',
                        mark: 1, // Default mark for MCQ, can be changed later
                        answers: answers,
                        essayLines: 3,
                        correctAnswerText: '' 
                    });
                    qIndex++;
                }
            });
        } else if (tagName === 'P') {
            if (textContent.startsWith('("')) continue; // Skip orphaned answer lines

            let mark = 1;
            let multiLineAnswer = '';
            let consumedAdditionalLines = 0;

            // Look ahead for an answer block
            let answerSearchIndex = i + 1;
            while(answerSearchIndex < elements.length && !elements[answerSearchIndex].textContent?.trim()) {
                answerSearchIndex++;
            }

            let answerFound = false;
            if (answerSearchIndex < elements.length && elements[answerSearchIndex].textContent?.trim().startsWith('("')) {
                let answerEndIndex = answerSearchIndex;
                let collectedText = '';

                for (let j = answerSearchIndex; j < elements.length; j++) {
                    const lineText = elements[j].textContent?.trim() || '';
                    if (!lineText && collectedText) break;
                    if (!lineText) continue;
                    
                    collectedText += lineText + '\n';
                    if (lineText.endsWith('")')) {
                        answerEndIndex = j;
                        answerFound = true;
                        break;
                    }
                }

                if (answerFound) {
                    multiLineAnswer = collectedText.replace(/^\s*\("/, '').replace(/\)"\s*$/, '').trim();
                    
                    let markSearchIndex = answerEndIndex + 1;
                    while(markSearchIndex < elements.length && !elements[markSearchIndex].textContent?.trim()) {
                        markSearchIndex++;
                    }

                    if (markSearchIndex < elements.length) {
                        const markText = elements[markSearchIndex].textContent?.trim();
                        if (markText) {
                           const convertedMarkText = convertArabicNumerals(markText);
                           if (/^\d+$/.test(convertedMarkText)) {
                               const parsedMark = parseInt(convertedMarkText, 10);
                               if (!isNaN(parsedMark) && parsedMark > 0) {
                                   mark = parsedMark;
                                   consumedAdditionalLines = markSearchIndex - i;
                               } else {
                                   consumedAdditionalLines = answerEndIndex - i;
                               }
                           } else {
                               consumedAdditionalLines = answerEndIndex - i;
                           }
                        } else {
                           consumedAdditionalLines = answerEndIndex - i;
                        }
                    } else {
                        consumedAdditionalLines = answerEndIndex - i;
                    }
                }
            }
            
            if (!answerFound) {
                let markSearchIndex = i + 1;
                while(markSearchIndex < elements.length && !elements[markSearchIndex].textContent?.trim()) {
                    markSearchIndex++;
                }
                if (markSearchIndex < elements.length) {
                    const markText = elements[markSearchIndex].textContent?.trim();
                     if (markText) {
                        const convertedMarkText = convertArabicNumerals(markText);
                        if (/^\d+$/.test(convertedMarkText)) {
                            const parsedMark = parseInt(convertedMarkText, 10);
                            if (!isNaN(parsedMark) && parsedMark > 0) {
                                mark = parsedMark;
                                consumedAdditionalLines = markSearchIndex - i;
                            }
                        }
                    }
                }
            }

            const isShortAnswer = textContent.includes('_') || /ـ{2,}/.test(textContent);

            if (isShortAnswer) {
                let displayQuestionText = textContent;
                let inlineCorrectAnswer = '';
                const parenthesesMatch = textContent.match(/\(([^)]+)\)\s*$/);
                
                if (parenthesesMatch) {
                    inlineCorrectAnswer = parenthesesMatch[1].trim();
                    displayQuestionText = textContent.replace(parenthesesMatch[0], '').trim();
                }

                const finalAnswer = inlineCorrectAnswer || multiLineAnswer;
                questions.push({
                    id: `doc_q_${Date.now()}_${qIndex}`,
                    name: `سؤال ${qIndex + 1}`,
                    text: displayQuestionText,
                    type: 'shortanswer',
                    visualType: 'shortanswer',
                    layout: 'full',
                    mark: mark,
                    answers: [{ id: 'a1', text: finalAnswer || '(انظر الورقة)', fraction: 100 }],
                    correctAnswerText: finalAnswer || '',
                });
                qIndex++;
            } else {
                const essayMatch = textContent.match(/^(.*)\*([\d٠-٩]+)\s*$/);
                let questionText = textContent;
                let essayLines = 3;
                if (essayMatch) {
                    questionText = essayMatch[1].trim();
                    essayLines = parseInt(convertArabicNumerals(essayMatch[2])) || 3;
                }
                questions.push({
                    id: `doc_q_${Date.now()}_${qIndex}`,
                    name: `سؤال ${qIndex + 1}`,
                    text: questionText,
                    type: 'essay',
                    visualType: 'essay',
                    layout: 'full',
                    mark: mark,
                    answers: [],
                    essayLines: essayLines,
                    correctAnswerText: multiLineAnswer || '(متروك لتقدير المصحح)'
                });
                qIndex++;
            }
            i += consumedAdditionalLines;
        }
    }
    return { questions };
  } catch (error) {
    return { questions: [], error: "حدث خطأ أثناء معالجة ملف Word." };
  }
};
