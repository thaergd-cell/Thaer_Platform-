
import { Question, Answer, ParsedExam, QuestionType } from '../types';

export const parseMoodleXML = (xmlContent: string): ParsedExam => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
    
    const questionNodes = xmlDoc.querySelectorAll('question');
    const questions: Question[] = [];

    questionNodes.forEach((node, index) => {
      const moodleType = node.getAttribute('type') || 'unknown';
      
      if (moodleType === 'category') return;

      const nameNode = node.querySelector('name > text');
      const textNode = node.querySelector('questiontext > text');
      const defaultGradeNode = node.querySelector('defaultgrade');
      
      if (!textNode) return;

      const name = nameNode?.textContent || `Question ${index + 1}`;
      const text = textNode.textContent || '';
      const mark = defaultGradeNode ? parseFloat(defaultGradeNode.textContent || '1') : 1;
      
      let visualType: QuestionType = 'multichoice';
      if (moodleType === 'essay') visualType = 'essay';
      else if (moodleType === 'shortanswer' || moodleType === 'numerical') visualType = 'shortanswer';
      else if (moodleType === 'truefalse') visualType = 'multichoice'; // ExamPaper handles detection of T/F via answer count

      const answerNodes = node.querySelectorAll('answer');
      const answers: Answer[] = [];

      answerNodes.forEach((ansNode, aIndex) => {
        const ansTextNode = ansNode.querySelector('text');
        const fractionAttr = ansNode.getAttribute('fraction');
        const feedbackNode = ansNode.querySelector('feedback > text');

        if (ansTextNode) {
          answers.push({
            id: `q${index}_a${aIndex}`,
            text: ansTextNode.textContent || '',
            fraction: fractionAttr ? parseFloat(fractionAttr) : 0,
            feedback: feedbackNode?.textContent || ''
          });
        }
      });

      let correctAnswerText = '';
      if (visualType !== 'multichoice') {
          const correctAns = answers.find(a => a.fraction === 100);
          if (correctAns) correctAnswerText = correctAns.text;
      }

      questions.push({
        id: `q_${Date.now()}_${index}`, 
        name,
        text,
        type: moodleType,
        visualType,
        layout: (visualType === 'essay' || visualType === 'shortanswer') ? 'full' : 'columns',
        mark,
        answers,
        essayLines: 3, 
        correctAnswerText
      });
    });

    if (questions.length === 0) {
      return { questions: [], error: "لم يتم العثور على أسئلة صالحة في الملف." };
    }

    return { questions };

  } catch (e) {
    return { questions: [], error: "حدث خطأ أثناء قراءة الملف. تأكد من أنه ملف XML صالح." };
  }
};
