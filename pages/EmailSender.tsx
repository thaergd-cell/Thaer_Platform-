
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Home, LogOut, Upload, Send, FileText, CheckCircle, AlertCircle, X, Eye, EyeOff, Loader2, BarChart3, ChevronDown, Sparkles, AlertTriangle } from 'lucide-react';
import { logoutUser } from '../utils/storage';
import { EmailRecipient, EmailCampaign } from '../types';
import { parseExcelForEmails } from '../utils/excelParser';
import { generateEmailDraft } from '../services/geminiService';
// @ts-ignore
import * as mammoth from 'mammoth';
import AppPasswordHelpModal from '../components/AppPasswordHelpModal';

const EmailSender: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const [campaign, setCampaign] = useState<EmailCampaign>({
      senderEmail: '',
      senderPassword: '',
      subject: '',
      body: '',
      recipients: []
  });

  const [resultsStats, setResultsStats] = useState({
      success: 0,
      failed: 0,
      total: 0
  });

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const handleCredentialSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!campaign.senderEmail || !campaign.senderPassword) return alert("الرجاء إدخال البيانات");
      setStep(2);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
          const recipients = await parseExcelForEmails(file);
          setCampaign(prev => ({ ...prev, recipients }));
      } catch (error: any) {
          alert(error);
      } finally {
          setLoading(false);
      }
  };

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
          try {
              const arrayBuffer = ev.target?.result as ArrayBuffer;
              const result = await mammoth.convertToHtml({ arrayBuffer });
              setCampaign(prev => ({ ...prev, body: result.value }));
          } catch (err) {
              alert("فشل في قراءة ملف الوورد");
          }
      };
      reader.readAsArrayBuffer(file);
  };

  const handleAiDraft = async () => {
      if (!campaign.subject) return alert("الرجاء كتابة موضوع الرسالة أولاً ليتمكن الذكاء الاصطناعي من صياغتها.");
      setAiLoading(true);
      try {
          const draft = await generateEmailDraft(campaign.subject);
          setCampaign(prev => ({ ...prev, body: draft }));
      } catch (error: any) {
          alert(error.message);
      } finally {
          setAiLoading(false);
      }
  };

  const startSending = async () => {
      if (campaign.recipients.length === 0) return alert("لا يوجد مستلمين");
      
      setStep(4);
      setSendingProgress(0);
      setLogs([]);
      let successCount = 0;
      let failedCount = 0;

      const currentRecipients = [...campaign.recipients];

      for (let i = 0; i < currentRecipients.length; i++) {
          const recipient = currentRecipients[i];
          setLogs(prev => [`جاري إرسال إلى ${recipient.email}...`, ...prev]);
          
          try {
              // إعداد Timeout لمدة 15 ثانية لتجنب التجمد
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 15000);

              const response = await fetch('./send_email.php', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      sender_email: campaign.senderEmail,
                      sender_password: campaign.senderPassword,
                      recipient_email: recipient.email,
                      subject: campaign.subject,
                      body: campaign.body
                  }),
                  signal: controller.signal
              });
              
              clearTimeout(timeoutId);

              // قراءة الرد كنص أولاً لتجنب الانهيار إذا لم يكن JSON
              const textResponse = await response.text();
              let result;
              
              try {
                  result = JSON.parse(textResponse);
              } catch (e) {
                  // إذا فشل تحويل الرد إلى JSON (مثلاً الخادم أعاد HTML خطأ أو كنت تشغل التطبيق محلياً بدون PHP)
                  throw new Error(`رد غير صالح من الخادم. (هل ملف send_email.php موجود؟). الرد: ${textResponse.substring(0, 30)}...`);
              }

              if (response.ok && result.success) {
                  recipient.status = 'sent';
                  successCount++;
                  setLogs(prev => [`✅ تم الإرسال: ${recipient.email}`, ...prev]);
              } else {
                  recipient.status = 'failed';
                  recipient.error = result.error || 'خطأ غير معروف من السيرفر';
                  failedCount++;
                  setLogs(prev => [`❌ فشل: ${recipient.email} - ${recipient.error}`, ...prev]);
              }

          } catch (err: any) {
              recipient.status = 'failed';
              if (err.name === 'AbortError') {
                  recipient.error = 'انتهت مهلة الاتصال بالخادم';
              } else {
                  recipient.error = err.message || 'خطأ في الشبكة';
              }
              failedCount++;
              setLogs(prev => [`❌ فشل: ${recipient.email} - ${recipient.error}`, ...prev]);
          }

          setSendingProgress(Math.round(((i + 1) / currentRecipients.length) * 100));
          setCampaign(prev => ({ ...prev, recipients: [...currentRecipients] }));
          
          // تأخير بسيط لمنع الحظر
          await new Promise(resolve => setTimeout(resolve, 500)); 
      }

      setResultsStats({
          success: successCount,
          failed: failedCount,
          total: currentRecipients.length
      });
      setTimeout(() => setShowResultsModal(true), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-tajawal flex flex-col relative">
       <nav className="bg-cyan-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg"><Mail size={24} /></div>
             <h1 className="text-xl font-bold">نظام المراسلات</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/" className="bg-cyan-800 hover:bg-cyan-700 px-4 py-2 rounded text-sm">الرئيسية</Link>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded text-sm">خروج</button>
          </div>
        </div>
      </nav>

      <AppPasswordHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* نافذة النتائج */}
      {showResultsModal && (
          <div className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 bg-cyan-900 text-white flex justify-between items-center">
                      <h2 className="text-lg font-bold">تقرير الإرسال</h2>
                      <button onClick={() => setShowResultsModal(false)}><X size={20}/></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                          <div className="bg-gray-100 p-3 rounded">
                              <p className="text-xs text-gray-500">الإجمالي</p>
                              <p className="text-2xl font-bold">{resultsStats.total}</p>
                          </div>
                          <div className="bg-green-100 p-3 rounded">
                              <p className="text-xs text-green-600">نجاح</p>
                              <p className="text-2xl font-bold text-green-700">{resultsStats.success}</p>
                          </div>
                          <div className="bg-red-100 p-3 rounded">
                              <p className="text-xs text-red-600">فشل</p>
                              <p className="text-2xl font-bold text-red-700">{resultsStats.failed}</p>
                          </div>
                      </div>
                      <div className="border rounded max-h-60 overflow-y-auto">
                          <table className="w-full text-sm">
                              <tbody className="divide-y">
                                  {campaign.recipients.map((r, i) => (
                                      <tr key={i} className="p-2 flex justify-between items-center">
                                          <td className="p-2">{r.email}</td>
                                          <td className="p-2">
                                              {r.status === 'sent' ? <span className="text-green-600 font-bold">تم</span> : <span className="text-red-500 text-xs">{r.error}</span>}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
                  <div className="p-4 bg-gray-50 flex justify-center gap-3">
                      <button onClick={() => window.location.reload()} className="px-6 py-2 bg-cyan-700 text-white rounded">بدء جديد</button>
                      <button onClick={() => setShowResultsModal(false)} className="px-6 py-2 border rounded">إغلاق</button>
                  </div>
              </div>
          </div>
      )}

      <main className="container mx-auto p-6 max-w-3xl flex-grow">
        {step === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center mb-6">إعدادات الإرسال</h2>
                <form onSubmit={handleCredentialSubmit} className="space-y-4">
                    <input type="email" placeholder="بريدك الإلكتروني (Gmail / Outlook)" required value={campaign.senderEmail} onChange={(e) => setCampaign({...campaign, senderEmail: e.target.value})} className="w-full p-3 border rounded text-right" dir="ltr" />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="App Password" required value={campaign.senderPassword} onChange={(e) => setCampaign({...campaign, senderPassword: e.target.value})} className="w-full p-3 border rounded text-right" dir="ltr" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-3 text-gray-400">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                    </div>
                    <button type="button" onClick={() => setShowHelpModal(true)} className="text-xs text-blue-600 hover:underline">كيف أحصل على App Password؟</button>
                    <button type="submit" className="w-full bg-cyan-700 text-white py-3 rounded font-bold hover:bg-cyan-800 transition">التالي</button>
                </form>
            </div>
        )}

        {step === 2 && (
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">رفع قائمة العناوين (Excel)</h2>
                <div className="border-2 border-dashed border-gray-300 rounded p-12 text-center relative hover:bg-gray-50 cursor-pointer">
                    <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {campaign.recipients.length > 0 ? <p className="text-green-600 font-bold">تم العثور على {campaign.recipients.length} عنوان</p> : <p>اضغط لرفع ملف الإكسل</p>}
                </div>
                {campaign.recipients.length > 0 && (
                    <button onClick={() => setStep(3)} className="w-full bg-cyan-700 text-white py-3 rounded mt-4">التالي: نص الرسالة</button>
                )}
            </div>
        )}

        {step === 3 && (
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">نص الرسالة</h2>
                <div className="mb-4">
                    <input placeholder="الموضوع" value={campaign.subject} onChange={e => setCampaign({...campaign, subject: e.target.value})} className="w-full p-3 border rounded" />
                </div>
                <div className="relative">
                    <textarea placeholder="الرسالة..." value={campaign.body} onChange={e => setCampaign({...campaign, body: e.target.value})} className="w-full p-4 border rounded min-h-[250px] mb-4"></textarea>
                    
                    {/* زر الذكاء الاصطناعي */}
                    <button 
                        onClick={handleAiDraft} 
                        disabled={aiLoading}
                        className="absolute bottom-6 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-70"
                    >
                        {aiLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> جاري الكتابة...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} /> صياغة بالذكاء الاصطناعي
                            </>
                        )}
                    </button>
                </div>

                <div className="flex gap-2">
                    <button onClick={startSending} className="flex-grow bg-cyan-700 text-white py-3 rounded font-bold">بدء الإرسال الفعلي</button>
                    <div className="relative cursor-pointer bg-blue-50 text-blue-700 px-4 py-3 rounded text-xs font-bold border border-blue-200 flex items-center gap-2 hover:bg-blue-100">
                        <Upload size={16} />
                        استيراد Word
                        <input type="file" accept=".docx" onChange={handleWordUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>
            </div>
        )}

        {step === 4 && (
             <div className="bg-white rounded-xl shadow p-6 text-center">
                 <h2 className="text-xl font-bold mb-4">جاري الإرسال ({sendingProgress}%)</h2>
                 <div className="w-full bg-gray-200 h-3 rounded mb-4 overflow-hidden"><div className="bg-cyan-600 h-full transition-all" style={{width: `${sendingProgress}%`}}></div></div>
                 <div className="bg-gray-900 text-white text-xs p-4 rounded h-40 overflow-y-auto text-left" dir="ltr">
                     {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                 </div>
                 <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200">
                     يتم الآن الاتصال بالسيرفر للإرسال الفعلي. في حال الفشل المحلي، يرجى رفع المشروع على سيرفر PHP.
                 </div>
             </div>
        )}
      </main>
    </div>
  );
};

export default EmailSender;
