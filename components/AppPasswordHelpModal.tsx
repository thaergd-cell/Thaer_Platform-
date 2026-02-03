
import React, { useState } from 'react';
import { X, Shield, Lock, Key, Search, ArrowRight, CheckCircle, Mail } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AppPasswordHelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'outlook'>('gmail');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Key className="text-cyan-600" />
                دليل تفعيل كلمة مرور التطبيق (App Password)
              </h2>
              <p className="text-sm text-gray-500 mt-1">يجب تفعيل هذه الميزة للسماح للمنصة بإرسال الرسائل نيابة عنك.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition bg-white p-2 rounded-full shadow-sm hover:shadow">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
            <button 
                onClick={() => setActiveTab('gmail')}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition border-b-2 ${activeTab === 'gmail' ? 'border-red-500 text-red-600 bg-red-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Gmail / Google
            </button>
            <button 
                onClick={() => setActiveTab('outlook')}
                className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition border-b-2 ${activeTab === 'outlook' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
            >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Outlook / Hotmail
            </button>
        </div>
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 bg-gray-50/50">
          
          {activeTab === 'gmail' && (
             <div className="space-y-8">
                <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded shadow-sm">
                    <h4 className="font-bold text-yellow-800 text-sm mb-1 flex items-center gap-2">
                        <Shield size={16}/> شرط أساسي: التحقق بخطوتين
                    </h4>
                    <p className="text-xs text-yellow-700">لكي يظهر خيار "كلمات مرور التطبيقات"، يجب عليك أولاً تفعيل <strong>التحقق بخطوتين (2-Step Verification)</strong> في حساب جوجل الخاص بك.</p>
                </div>

                <StepItem 
                    num={1} 
                    title="الذهاب إلى إعدادات الأمان"
                    desc="انتقل إلى صفحة إدارة حساب Google، ثم اختر تبويب 'الأمان' (Security) من القائمة الجانبية."
                >
                    <div className="bg-white border rounded-lg p-3 shadow-sm max-w-sm mx-auto">
                        <div className="flex gap-4">
                            <div className="w-1/4 space-y-2 border-l pl-2">
                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                                <div className="h-2 bg-blue-100 rounded w-full border-r-2 border-blue-500"></div>
                                <div className="h-2 bg-gray-200 rounded w-full"></div>
                            </div>
                            <div className="flex-grow">
                                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                                <div className="border p-2 rounded bg-gray-50 text-center text-xs text-gray-500">Security</div>
                            </div>
                        </div>
                    </div>
                </StepItem>

                <StepItem 
                    num={2} 
                    title="البحث عن App Passwords"
                    desc="في مربع البحث العلوي في صفحة الحساب، اكتب 'App Passwords' أو 'كلمات مرور التطبيقات' واضغط على النتيجة."
                >
                    <div className="bg-white border rounded-lg p-3 shadow-sm max-w-sm mx-auto">
                        <div className="relative border rounded-full bg-gray-100 px-3 py-1.5 flex items-center gap-2">
                            <Search size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-600">App Passwords</span>
                        </div>
                        <div className="mt-1 ml-4 bg-white shadow p-2 rounded border absolute">
                            <div className="text-xs font-bold text-gray-700">App passwords</div>
                            <div className="text-[10px] text-gray-400">Security</div>
                        </div>
                    </div>
                </StepItem>

                <StepItem 
                    num={3} 
                    title="إنشاء كلمة مرور جديدة"
                    desc="اكتب اسماً للتطبيق (مثلاً: Thaer Platform) ثم اضغط على زر Create (إنشاء)."
                >
                    <div className="bg-white border rounded-lg p-4 shadow-sm max-w-sm mx-auto text-center">
                        <div className="text-xs text-gray-500 mb-2">Select app and device</div>
                        <div className="flex gap-2 justify-center">
                            <div className="border rounded px-2 py-1 text-xs bg-gray-50 text-gray-800">Thaer Platform</div>
                            <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">Create</div>
                        </div>
                    </div>
                </StepItem>

                <StepItem 
                    num={4} 
                    title="نسخ الرمز واستخدامه"
                    desc="سيظهر لك رمز مكون من 16 حرفاً في صندوق أصفر. انسخ هذا الرمز (بدون مسافات) وضعه في حقل 'كلمة المرور' في المنصة."
                >
                    <div className="bg-white border rounded-lg p-4 shadow-sm max-w-sm mx-auto text-center relative overflow-hidden">
                        <div className="bg-yellow-100 p-3 rounded border border-yellow-200 mb-2">
                            <span className="font-mono font-bold text-lg text-black tracking-widest">xxxx xxxx xxxx xxxx</span>
                        </div>
                        <p className="text-[10px] text-gray-500">انسخ هذا الرمز واستخدمه بدلاً من كلمة مرورك العادية.</p>
                    </div>
                </StepItem>
             </div>
          )}

          {activeTab === 'outlook' && (
             <div className="space-y-8">
                 <div className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded shadow-sm">
                    <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2">
                        <Shield size={16}/> متطلب: التحقق بخطوتين
                    </h4>
                    <p className="text-xs text-blue-700">يجب تفعيل <strong>Two-step verification</strong> في إعدادات الأمان المتقدمة لتمكين هذه الميزة.</p>
                </div>

                <StepItem 
                    num={1} 
                    title="إعدادات الأمان المتقدمة"
                    desc="سجل الدخول إلى حساب Microsoft، اذهب إلى Security (الأمان) ثم اختر Advanced security options (خيارات الأمان المتقدمة)."
                >
                     <div className="bg-white border rounded-lg p-3 shadow-sm max-w-sm mx-auto">
                        <div className="flex gap-2 border-b pb-2 mb-2">
                            <div className="w-4 h-4 bg-blue-600"></div>
                            <span className="text-xs font-bold">Microsoft Account</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-100 h-10 rounded"></div>
                            <div className="bg-blue-50 border border-blue-200 h-10 rounded flex items-center justify-center">
                                <span className="text-[10px] text-blue-700 font-bold">Advanced Security</span>
                            </div>
                        </div>
                    </div>
                </StepItem>

                <StepItem 
                    num={2} 
                    title="إنشاء كلمة مرور التطبيق"
                    desc="مرر للأسفل حتى تجد قسم 'App passwords'، واضغط على 'Create a new app password'."
                >
                     <div className="bg-white border rounded-lg p-4 shadow-sm max-w-sm mx-auto">
                        <h5 className="text-xs font-bold mb-1">App passwords</h5>
                        <p className="text-[10px] text-gray-500 mb-2">Use app passwords with apps that don't support two-step verification.</p>
                        <div className="text-xs text-blue-600 underline">Create a new app password</div>
                    </div>
                </StepItem>

                <StepItem 
                    num={3} 
                    title="نسخ الرمز"
                    desc="سيظهر لك الرمز مباشرة. انسخه واستخدمه في المنصة بدلاً من كلمة المرور الخاصة بحسابك."
                >
                    <div className="bg-white border rounded-lg p-4 shadow-sm max-w-sm mx-auto text-center">
                        <div className="font-mono text-sm bg-gray-100 p-2 rounded border border-gray-300 mb-1 select-all">
                            qwer tyui opas dfgh
                        </div>
                        <span className="text-[10px] text-green-600 flex items-center justify-center gap-1"><CheckCircle size={10}/> App password created</span>
                    </div>
                </StepItem>
             </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-medium flex items-center gap-2"
          >
            إغلاق الدليل
          </button>
        </div>
      </div>
    </div>
  );
};

const StepItem: React.FC<{num: number, title: string, desc: string, children: React.ReactNode}> = ({ num, title, desc, children }) => (
    <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-md mt-1">
            {num}
        </div>
        <div className="flex-grow">
            <h3 className="font-bold text-gray-800 text-base mb-1">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{desc}</p>
            <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                {children}
            </div>
        </div>
    </div>
);

export default AppPasswordHelpModal;
