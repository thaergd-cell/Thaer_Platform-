
import React from 'react';
import { X, FileText, List, Type, PenTool, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4 print:hidden">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            دليل استخدام النظام
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          
          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-3 border-b pb-2">1. استيراد ملفات Word (.docx)</h3>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-600" /> أسئلة الصواب والخطأ
                </h4>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>يتم التعرف عليها تلقائياً إذا كان السؤال يحتوي على <strong>خيارين فقط</strong> (مثل: نعم/لا أو صح/خطأ).</li>
                  <li>سيظهر للطالب <strong>أقواس فارغة ( )</strong> في بداية السؤال.</li>
                  <li>لتحديد الإجابة الصحيحة، اجعل نص الخيار <strong>عريضاً (Bold)</strong> في ملف الوورد.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <List size={16} /> أسئلة الاختيار من متعدد
                </h4>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>السؤال في <strong>قائمة نقطية</strong> (مستوى 1).</li>
                  <li>الخيارات (3 أو أكثر) في <strong>قائمة فرعية</strong> (مستوى 2).</li>
                  <li>الإجابة الصحيحة تكون <strong>عريضة (Bold)</strong>.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <PenTool size={16} /> أسئلة أكمل الفراغ
                </h4>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>استخدم الشرطة السفلية <strong>____</strong> للفراغ.</li>
                  <li>ضع الإجابة الصحيحة بين قوسين <code>( )</code> في نهاية السطر للإرشاد في ورقة المعلم.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <Type size={16} /> أسئلة الشرح / المقالية
                </h4>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>تُكتب كأسئلة عادية في فقرات منفصلة.</li>
                  <li>لتحديد الإجابة النموذجية، اكتبها في السطر التالي للسؤال مباشرة داخل <code>("...")</code> (مثال: <code>("هذا هو الجواب النموذجي.")</code>).</li>
                  <li>لتحديد عدد أسطر الإجابة، أضف <code>*</code> متبوعاً برقم في نهاية السؤال (مثال: <code>اشرح... *5</code>).</li>
                  <li>أي سؤال لا يطابق القواعد الأخرى سيُعامل كسؤال مقالي بـ 3 أسطر افتراضية.</li>
                </ul>
              </div>

            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-blue-800 mb-3 border-b pb-2">2. استيراد ملفات Moodle (.xml)</h3>
            <p className="text-sm text-gray-700">
              يدعم النظام ملفات Moodle XML المصدرة بالكامل، بما فيها الأسئلة التي تحتوي على خيارين فقط حيث تُعرض كنمط صواب وخطأ تلقائياً.
            </p>
          </section>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
