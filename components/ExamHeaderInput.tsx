
import React, { useState, useRef } from 'react';
import { ExamDetails, ExamStyle } from '../types';
import { FileUp, FileText, RefreshCw, ImagePlus, Trash2, Settings, Layout, AlignLeft, AlignCenter, AlignRight, Type, CheckSquare, PlusCircle, HelpCircle, FileCheck, Text, Download, Upload, Printer, Image, Loader2, AlignJustify } from 'lucide-react';

interface Props {
  details: ExamDetails;
  setDetails: (details: ExamDetails) => void;
  style: ExamStyle;
  setStyle: (style: ExamStyle) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onManualAdd: () => void;
  onSaveAsPdf: () => void;
  onSaveAsImage: () => void;
  onSaveAsWord: () => void;
  isSaving: boolean;
  onReset: () => void;
  onHelp: () => void;
  hasQuestions: boolean;
  onExportWork: () => void;
  onImportWork: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExamHeaderInput: React.FC<Props> = ({ details, setDetails, style, setStyle, onFileUpload, onManualAdd, onSaveAsPdf, onSaveAsImage, onSaveAsWord, isSaving, onReset, onHelp, hasQuestions, onExportWork, onImportWork }) => {
  
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetails({ ...details, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setDetails({ ...details, logo: null });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8 no-print relative">
      
      <button 
        type="button"
        onClick={onHelp}
        className="absolute top-3 left-3 z-10 text-gray-400 hover:text-blue-600 transition bg-white/80 rounded-full p-1 hover:bg-blue-50"
        title="دليل الاستخدام"
      >
        <HelpCircle size={24} />
      </button>

      <div className="flex border-b bg-gray-50">
          <button 
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'content' ? 'bg-white text-blue-700 border-t-2 border-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
             <Settings size={18} />
             البيانات الأساسية
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'design' ? 'bg-white text-blue-700 border-t-2 border-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
             <Layout size={18} />
             التنسيق والمظهر
          </button>
      </div>

      <div className="p-6">
          
          {activeTab === 'content' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الجامعة</label>
                    <input
                        type="text"
                        name="university"
                        value={details.university}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                        placeholder="مثال: الجامعة الأردنية"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكلية</label>
                    <input
                        type="text"
                        name="college"
                        value={details.college}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                        placeholder="مثال: كلية العلوم"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القسم / الدائرة</label>
                    <input
                        type="text"
                        name="department"
                        value={details.department}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                        placeholder="مثال: قسم الفيزياء"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المساق / المقرر</label>
                    <input
                        type="text"
                        name="examName"
                        value={details.examName}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                        placeholder="مثال: فيزياء عامة 101"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الامتحان</label>
                    <select
                        name="examType"
                        value={details.examType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                    >
                        <option value="">-- اختر --</option>
                        <option value="الامتحان الأول">الامتحان الأول</option>
                        <option value="الامتحان الثاني">الامتحان الثاني</option>
                        <option value="الامتحان النصفي">الامتحان النصفي</option>
                        <option value="الامتحان النهائي">الامتحان النهائي</option>
                        <option value="الامتحان القصير">الامتحان القصير (Quiz)</option>
                        <option value="امتحان تكميلي">امتحان تكميلي</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مدة الامتحان</label>
                    <input
                        type="text"
                        name="duration"
                        value={details.duration}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white text-gray-900"
                        placeholder="مثال: ساعتان"
                    />
                    </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <label className="block text-sm font-medium text-gray-700 mb-2">شعار المؤسسة (اختياري)</label>
                    <div className="flex items-center gap-4">
                        {details.logo ? (
                            <div className="relative group">
                                <img src={details.logo} alt="Logo Preview" className="h-16 object-contain border rounded bg-white p-1" />
                                <button onClick={removeLogo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded border flex items-center justify-center text-gray-400">
                                <ImagePlus size={24} />
                            </div>
                        )}
                        <div className="flex-grow">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === 'design' && (
              <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b">
                      <div>
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Layout size={16} /> تخطيط الصفحة
                          </h4>
                          <div className="space-y-2">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="columns" 
                                    checked={style.columns === 1}
                                    onChange={() => setStyle({...style, columns: 1})}
                                    className="text-blue-600" 
                                 />
                                 <span className="text-sm text-gray-700">عمود واحد</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    name="columns" 
                                    checked={style.columns === 2}
                                    onChange={() => setStyle({...style, columns: 2})}
                                    className="text-blue-600" 
                                 />
                                 <span className="text-sm text-gray-700">عمودان</span>
                             </label>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <Type size={16} /> الخطوط
                          </h4>
                          <select 
                                value={style.fontFamily}
                                onChange={(e) => setStyle({...style, fontFamily: e.target.value as any})}
                                className="w-full p-2 border rounded text-sm bg-white"
                            >
                                <option value="Tajawal">Tajawal</option>
                                <option value="Cairo">Cairo</option>
                                <option value="Amiri">Amiri</option>
                            </select>
                      </div>

                      <div>
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <AlignJustify size={16} /> اتجاه النص
                          </h4>
                          <div className="flex bg-gray-100 p-1 rounded-lg">
                              <button 
                                  onClick={() => setStyle({...style, textDirection: 'rtl'})}
                                  className={`flex-1 py-1 rounded-md text-sm font-bold flex items-center justify-center gap-1 ${style.textDirection === 'rtl' ? 'bg-white shadow' : 'text-gray-500'}`}
                              >
                                  <AlignRight size={14}/> يمين-يسار
                              </button>
                              <button 
                                  onClick={() => setStyle({...style, textDirection: 'ltr'})}
                                  className={`flex-1 py-1 rounded-md text-sm font-bold flex items-center justify-center gap-1 ${style.textDirection === 'ltr' ? 'bg-white shadow' : 'text-gray-500'}`}
                              >
                                  <AlignLeft size={14}/> يسار-يمين
                              </button>
                          </div>
                      </div>
                      
                      <div>
                          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                              <CheckSquare size={16} /> خيارات إضافية
                          </h4>
                          <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={style.showStudentAnswerSheet}
                                        onChange={(e) => setStyle({...style, showStudentAnswerSheet: e.target.checked})}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">ورقة إجابة للطالب</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={style.showAnswerKey}
                                        onChange={(e) => setStyle({...style, showAnswerKey: e.target.checked})}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">مفتاح الإجابة (للمعلم)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={style.showStudentId} onChange={(e) => setStyle({...style, showStudentId: e.target.checked})} className="rounded text-blue-600" />
                                    <span className="text-sm text-gray-700">حقل الرقم الجامعي</span>
                                </label>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                      <button onClick={onExportWork} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-bold border transition shadow-sm">
                          <Download size={18} /> تصدير ملف العمل (.json)
                      </button>
                      <button onClick={() => importFileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-bold border transition shadow-sm">
                          <Upload size={18} /> استيراد ملف العمل
                      </button>
                      <input type="file" ref={importFileRef} onChange={onImportWork} accept=".json" className="hidden" />
                  </div>
              </div>
          )}

          <div className="flex flex-wrap gap-4 items-center border-t pt-4 mt-6">
            <div className="flex items-center gap-3">
                <input type="file" accept=".xml,.docx" onChange={onFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md font-bold">
                    <FileUp size={20} /> رفع الأسئلة (Word/Moodle)
                </label>
            </div>

            {hasQuestions && (
            <>
                <div className="flex items-center gap-2 mr-auto">
                    <button
                        type="button"
                        onClick={onSaveAsWord}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md font-bold disabled:opacity-50"
                    >
                        <FileText size={18} /> حفظ كملف وورد
                    </button>
                    <button
                        type="button"
                        onClick={onSaveAsImage}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition shadow-md font-bold disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Image size={18} />}
                        حفظ كصورة
                    </button>
                    <button
                        type="button"
                        onClick={onSaveAsPdf}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition shadow-md font-bold disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <FileText size={20} />}
                         حفظ PDF
                    </button>
                </div>

                <button
                type="button"
                onClick={onReset}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gray-100 text-gray-600 border px-6 py-2.5 rounded-lg hover:bg-gray-200 font-bold disabled:opacity-50"
                >
                <RefreshCw size={18} /> مسح الكل
                </button>
            </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExamHeaderInput;