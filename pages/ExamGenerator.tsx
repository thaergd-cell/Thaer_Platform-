
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ExamDetails, Question, ExamStyle } from '../types';
import { parseMoodleXML } from '../utils/xmlParser';
import { parseWordDoc } from '../utils/wordParser';
import ExamHeaderInput from '../components/ExamHeaderInput';
import ExamPaper from '../components/ExamPaper';
import QuestionEditor from '../components/QuestionEditor';
import HelpModal from '../components/HelpModal';
import { GraduationCap, LogOut, RefreshCw, FileText, Printer, Image, Loader2 } from 'lucide-react';
import { logoutUser } from '../utils/storage';

declare var html2pdf: any;
declare var html2canvas: any;

const STORAGE_KEY = 'moodle_exam_generator_details';
const STYLE_STORAGE_KEY = 'moodle_exam_generator_style';

const ExamGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [examDetails, setExamDetails] = useState<ExamDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...JSON.parse(saved), date: new Date().toISOString().split('T')[0] };
    } catch (e) {}
    return { university: 'جامعة بوليتكنك فلسطين', college: 'كلية الفنون الرقمية والتصميم', department: 'دائرة الوسائط المتعددة والفنون الرقمية', examName: 'صناعة واخراج الافلام', examType: '', duration: '', date: new Date().toISOString().split('T')[0], logo: null };
  });

  const [examStyle, setExamStyle] = useState<ExamStyle>(() => {
    try {
      const saved = localStorage.getItem(STYLE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { fontFamily: 'Tajawal', columns: 2, answerLayout: 'auto', headerColor: '#000000', questionColor: '#000000', baseFontSize: 'base', headerSizes: { university: 'text-xl', college: 'text-lg', department: 'text-xl', examName: 'text-lg' }, showColumnDivider: false, questionStyle: 'simple', showAnswerKey: true, showStudentAnswerSheet: true, showStudentId: true, textDirection: 'rtl', showFooter: false, footerText: 'مع تمنياتي بالتوفيق' };
  });

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [examVersions, setExamVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({ shuffleQuestions: false, shuffleAnswers: false, groupByType: false, selectionMode: 'all' as 'all'|'manual', selectedIds: [] as string[] });
  const [showHelp, setShowHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(examDetails)), [examDetails]);
  useEffect(() => localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(examStyle)), [examStyle]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
        const result = file.name.endsWith('.docx') ? await parseWordDoc(await file.arrayBuffer()) : parseMoodleXML(await file.text());
        if (result.questions) setAllQuestions(prev => [...prev, ...result.questions]);
    } catch (err) { alert('فشل قراءة الملف'); }
    setLoading(false);
    e.target.value = '';
  };

  const generatePDF = async (elementId: string, fileName: string) => {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) {
        alert("لم يتم العثور على عنصر المصدر للطباعة.");
        return;
    }

    setLoading(true);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert("لا يمكن إنشاء بيئة طباعة معزولة.");
      setLoading(false);
      document.body.removeChild(iframe);
      return;
    }

    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
    let stylesHtml = '';
    stylesheets.forEach(sheet => {
      stylesHtml += sheet.outerHTML;
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>Export</title>
          ${stylesHtml}
          <style>
            body { 
              margin: 0 !important; 
              padding: 0 !important;
              background-color: #fff;
            }
          </style>
        </head>
        <body>
          ${sourceElement.innerHTML}
        </body>
      </html>
    `;
    
    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const opt = {
        margin: [10, 15, 15, 15],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2.5, 
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
        await html2pdf().from(iframeDoc.body).set(opt).save();
    } catch (e) {
        console.error("PDF Generation Error: ", e);
        alert('تعذر إنشاء ملف PDF. قد يكون بسبب حجمه الكبير أو وجود خطأ داخلي.');
    } finally {
        document.body.removeChild(iframe);
        setLoading(false);
    }
  };
  
  const handleSaveAsImage = async (elementId: string, fileName: string) => {
      const element = document.getElementById(elementId);
      if (!element) return;
      
      const contentToSave = element.querySelector('.page-container') as HTMLElement;
      if (!contentToSave) {
          alert("لم يتم العثور على محتوى للحفظ.");
          return;
      }

      setLoading(true);

      const originalStyles = contentToSave.style.cssText;
      contentToSave.style.margin = '0';
      contentToSave.style.boxShadow = 'none';
      contentToSave.style.width = '210mm';
      contentToSave.style.minHeight = '297mm';

      try {
          const canvas = await html2canvas(contentToSave, {
              scale: 2.5,
              useCORS: true,
              logging: false,
              onclone: (clonedDoc: Document) => {
                  clonedDoc.body.classList.add('pdf-export');
              }
          });
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (e) {
          console.error("Image Saving Error: ", e);
          alert('تعذر حفظ الملف كصورة.');
      } finally {
          contentToSave.style.cssText = originalStyles;
          setLoading(false);
      }
  };

  const handleSaveAsWord = (questionsToExport: Question[], versionLabel: string, fileName: string) => {
    setLoading(true);

    const font = examStyle.fontFamily || 'Tajawal';
    const styles = `
      body { direction: rtl; font-family: '${font}', Arial, sans-serif; font-size: 12pt; text-align: right; }
      @page WordSection1 { size: 8.27in 11.69in; margin: .7in .7in .7in .7in; mso-header-margin: .5in; mso-footer-margin: .5in; mso-paper-source: 0; }
      div.WordSection1 { page: WordSection1; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 4px; vertical-align: top; }
      p { margin: 0 0 5px 0; }
      .header-table td { vertical-align: middle; text-align: center; }
      .header-table .right { text-align: right; }
      .header-table .left { text-align: left; }
      .student-info-table { border: 1px solid black; margin-top: 10px; }
      .student-info-table td { font-weight: bold; font-size: 11pt; padding: 8px; }
      .section-title { font-size: 14pt; font-weight: bold; border-bottom: 2px solid black; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; }
      .question-item { margin-bottom: 12px; page-break-inside: avoid; }
      .question-text { font-weight: bold; display: inline; }
      .question-mark { font-size: 9pt; color: #555555; margin-right: 8px; }
      .answer-options { margin-top: 5px; font-size: 11pt; padding-right: 20px;}
      .answer-option { margin-bottom: 4px; }
      .columns-table td { width: 50%; padding: 0 10px; }
    `;

    // HEADER
    let headerHtml = `
      <table class="header-table">
        <tr>
          <td class="right" style="width: 40%;">
            <p style="font-size: 14pt; font-weight: bold;">${examDetails.university}</p>
            <p style="font-size: 12pt;">${examDetails.college}</p>
          </td>
          <td style="width: 20%;">${examDetails.logo ? `<img src="${examDetails.logo}" alt="Logo" style="max-height: 70px; margin: 0 auto;" />` : ''}</td>
          <td class="left" style="width: 40%;">
            <p style="font-size: 14pt; font-weight: bold;">${examDetails.department}</p>
            <p style="font-size: 12pt;">${examDetails.examName} ${versionLabel ? `- نموذج ${versionLabel}` : ''}</p>
          </td>
        </tr>
      </table>
      <table class="student-info-table">
        <tr>
          <td>اسم الطالب: ........................................</td>
          ${examStyle.showStudentId ? '<td>الرقم الجامعي: ..................................</td>' : ''}
        </tr>
      </table>
    `;

    // QUESTIONS
    const sectionOrder = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
    const sectionInstructions = { 'multichoice': 'اختر الإجابة الصحيحة فيما يلي.', 'shortanswer': 'أكمل الفراغات التالية.', 'essay': 'أجب عن الأسئلة التالية.', 'truefalse': 'ضع إشارة (✓) أمام العبارة الصحيحة و (✗) أمام الخاطئة.' };
    
    const questionGroups: { type: string, layout: 'columns' | 'full', items: Question[] }[] = [];
    questionsToExport.forEach(q => {
        let qType = (q.visualType || q.type) as string;
        if (q.answers && q.answers.length === 2 && qType === 'multichoice') qType = 'truefalse';
        const qLayout = q.layout || (qType === 'multichoice' ? 'columns' : 'full');
        let lastGroup = questionGroups[questionGroups.length - 1];
        if (!lastGroup || lastGroup.type !== qType) { questionGroups.push({ type: qType, layout: qLayout, items: [q] }); } 
        else { lastGroup.items.push(q); }
    });

    let questionsHtml = '';
    questionGroups.forEach((group, gIndex) => {
      questionsHtml += `<div class="section-title">السؤال ${sectionOrder[gIndex] || ''}: ${(sectionInstructions as any)[group.type]}</div>`;

      const renderQuestion = (q: Question, qIndex: number) => {
        let answersHtml = '';
        if (group.type === 'multichoice') {
          answersHtml = `<div class="answer-options">`;
          q.answers.forEach((ans, ansIndex) => { answersHtml += `<p class="answer-option"><strong>${['أ', 'ب', 'ج', 'د', 'هـ'][ansIndex]}.</strong> ${ans.text.replace(/<[^>]+>/g, '')}</p>`; });
          answersHtml += `</div>`;
        } else if (group.type === 'essay') {
          answersHtml = `<div class="answer-options">`;
          for(let i=0; i < (q.essayLines || 3); i++) { answersHtml += `<p style="border-bottom: 1px dotted #888888; height: 20px; margin: 8px 0;">&nbsp;</p>`; }
          answersHtml += `</div>`;
        }
        
        const questionText = q.text.replace(/<[^>]+>/g, '');
        const questionPrefix = group.type === 'truefalse' ? `<span style="font-weight: bold; border: 1px solid black; padding: 0 8px; margin-left: 5px;">&nbsp;</span>` : '';

        return `
          <div class="question-item">
            <p>${questionPrefix}<span class="question-text">${qIndex + 1}. ${questionText}</span><span class="question-mark">(${q.mark} علامة)</span></p>
            ${answersHtml}
          </div>
        `;
      };

      if (group.layout === 'columns' && examStyle.columns === 2) {
        questionsHtml += `<table class="columns-table"><tr><td style="border-left: 1px solid #ccc;">`;
        group.items.forEach((q, i) => { if (i % 2 === 0) questionsHtml += renderQuestion(q, i); });
        questionsHtml += `</td><td>`;
        group.items.forEach((q, i) => { if (i % 2 !== 0) questionsHtml += renderQuestion(q, i); });
        questionsHtml += `</td></tr></table>`;
      } else {
        group.items.forEach((q, i) => { questionsHtml += renderQuestion(q, i); });
      }
    });
    
    const finalHtmlContent = `<div class="WordSection1">${headerHtml}${questionsHtml}</div>`;
    const fullHtml = `
      <html xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset='utf-8'><title>${examDetails.examName || 'Exam'}</title>
      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom><w:DoNotTrackMoves/><w:DoNotTrackFormatting/><w:RtlGutter/></w:WordDocument></xml><![endif]-->
      <style>${styles}</style></head>
      <body>${finalHtmlContent}</body>
      </html>`;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(fullHtml);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = fileName;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    setLoading(false);
  };

  const handleExportWork = () => {
      const data = {
          examDetails,
          examStyle,
          allQuestions,
          exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_project_${examDetails.examName || 'untitled'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImportWork = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.examDetails) setExamDetails(data.examDetails);
              if (data.examStyle) setExamStyle(data.examStyle);
              if (data.allQuestions) setAllQuestions(data.allQuestions);
              alert('تم استيراد بيانات الامتحان بنجاح!');
          } catch (err) {
              alert('الملف غير صالح أو تالف.');
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const handleGenerateVersions = (settings: any) => {
    const mcqs = allQuestions.filter(q => (q.visualType || q.type) === 'multichoice');
    const essays = allQuestions.filter(q => (q.visualType || q.type) === 'essay');
    const shorts = allQuestions.filter(q => (q.visualType || q.type) === 'shortanswer');

    const versions = [];
    for (let i = 0; i < settings.count; i++) {
        const q = [
            ...shuffleArray(mcqs).slice(0, settings.mcqCount), 
            ...shuffleArray(essays).slice(0, settings.essayCount), 
            ...shuffleArray(shorts).slice(0, settings.shortCount)
        ];
        versions.push({ id: `v${i}`, label: String.fromCharCode(65 + i), questions: q });
    }
    setExamVersions(versions);
  };

  const shuffleArray = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());
  const handleLogout = () => { logoutUser(); navigate('/'); };

  return (
    <div className={`min-h-screen bg-gray-100 font-tajawal`}>
      <nav className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg no-print">
          <div className="flex items-center gap-3 font-bold text-lg"><GraduationCap size={32}/> نظام إعداد الامتحانات الذكي</div>
          <div className="flex gap-4 items-center font-bold">
            <Link to="/" className="hover:text-blue-200 transition">الرئيسية</Link>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-1.5 rounded-lg hover:bg-red-700 transition flex items-center gap-2"> خروج</button>
          </div>
      </nav>
      
      <main className="container mx-auto p-4 md:p-8">
          <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
          
          <ExamHeaderInput 
            details={examDetails} 
            setDetails={setExamDetails} 
            style={examStyle} setStyle={setExamStyle} 
            onFileUpload={handleFileUpload} onManualAdd={() => {}} 
            onSaveAsPdf={() => generatePDF('single-exam-content', 'exam.pdf')} 
            onSaveAsImage={() => handleSaveAsImage('single-exam-content', 'exam.png')}
            onSaveAsWord={() => handleSaveAsWord(allQuestions, '', `${examDetails.examName || 'exam'}.doc`)}
            isSaving={loading}
            onReset={() => setShowResetConfirm(true)} onHelp={() => setShowHelp(true)} 
            hasQuestions={allQuestions.length > 0} 
            onExportWork={handleExportWork}
            onImportWork={handleImportWork}
          />
          
          {loading && (
            <div className="fixed inset-0 bg-black/60 z-[99999] flex flex-col items-center justify-center text-white text-center">
                <RefreshCw size={60} className="animate-spin mb-4 text-blue-400" />
                <h3 className="text-2xl font-bold">جاري العمل... يرجى الانتظار</h3>
            </div>
          )}
          
          <QuestionEditor 
            allQuestions={allQuestions} setAllQuestions={setAllQuestions} 
            config={config} setConfig={setConfig} 
            onGenerateVersions={handleGenerateVersions} 
          />
          
          {allQuestions.length > 0 && examVersions.length === 0 && (
              <div className="mb-12">
                  <div className="bg-white rounded-xl shadow-2xl p-4 mb-4 no-print">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
                        <h3 className="font-bold text-gray-700 text-sm">معاينة الامتحان وتصديره:</h3>
                    </div>
                  </div>
                  <div id="single-exam-content">
                    <ExamPaper details={examDetails} style={examStyle} questions={allQuestions} versionLabel="" />
                  </div>
              </div>
          )}

          {examVersions.map(v => (
            <div key={v.id} className="mt-12">
                <div className="bg-white rounded-xl shadow-2xl p-4 border-t-8 border-indigo-600 no-print mb-4">
                    <div className="p-4 bg-indigo-50 border-b flex justify-between items-center rounded-t-xl">
                        <span className="font-bold text-indigo-900">نموذج ( {v.label} )</span>
                        <div className="flex gap-2">
                           <button onClick={() => handleSaveAsWord(v.questions, v.label, `exam_${v.label}.doc`)} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md disabled:opacity-50"><FileText size={16}/> حفظ كملف وورد</button>
                           <button onClick={() => handleSaveAsImage(v.id, `exam_${v.label}.png`)} disabled={loading} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                               {loading ? <Loader2 size={16} className="animate-spin"/> : <Image size={16}/>} حفظ صورة
                           </button>
                           <button onClick={() => generatePDF(v.id, `exam_${v.label}.pdf`)} disabled={loading} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md disabled:opacity-50">
                               {loading ? <Loader2 size={16} className="animate-spin"/> : <FileText size={16}/>} حفظ PDF
                           </button>
                        </div>
                    </div>
                </div>
                <div id={v.id}>
                    <ExamPaper details={examDetails} style={examStyle} questions={v.questions} versionLabel={v.label} />
                </div>
            </div>
          ))}
      </main>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm border-t-4 border-red-600">
                <h3 className="font-bold text-2xl mb-2">تنبيه!</h3>
                <p className="text-gray-500 mb-6">سيتم مسح كافة البيانات الحالية، هل أنت متأكد؟</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold">إلغاء</button>
                    <button onClick={() => {setAllQuestions([]); setExamVersions([]); setShowResetConfirm(false);}} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">تأكيد</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ExamGenerator;
