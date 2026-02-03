
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, FileText, PlayCircle, Lock, Award, User, BookOpen, Send, Linkedin, Mail, LogOut, Activity, Sigma, Youtube, Facebook, Instagram, AtSign } from 'lucide-react';
import { getLandingConfig, getCurrentUser, logoutUser } from '../utils/storage';
import { LandingPageConfig } from '../types';

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    <path d="M12 3v11.5" />
    <path d="M16 7.5c0 4.42-3.58 8-8 8s-8-3.58-8-8" />
  </svg>
);

const LandingPage: React.FC = () => {
  const [config, setConfig] = useState<LandingPageConfig>(getLandingConfig());
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();

  useEffect(() => {
      // Re-fetch to ensure we have latest data from storage
      setConfig(getLandingConfig());
      setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
      logoutUser();
      setUser(null);
      navigate('/');
  };

  const handleScrollToTools = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const canSeeExams = !user || user.role === 'admin' || user.permissions.canAccessExam;
  const canSeeCourses = !user || user.role === 'admin' || user.permissions.canAccessCourses;
  const canSeeEmail = !user || user.role === 'admin' || user.permissions.canAccessEmail;
  const canSeeMath = !user || user.role === 'admin' || user.permissions.canAccessMath;

  return (
    <div className="min-h-screen bg-gray-50 font-tajawal flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-50 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center backdrop-blur-md bg-white/30 rounded-full px-6 py-3 border border-white/50 shadow-sm">
          <div className="flex items-center gap-2 text-blue-900">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
               <GraduationCap size={24} />
            </div>
            <span className="font-bold text-lg md:text-xl">منصة {config.heroSubtitle}</span>
          </div>
          <div className="flex items-center gap-4">
             {canSeeCourses && <Link to="/courses" className="text-gray-700 font-medium hover:text-blue-700 hidden md:block">الدورات</Link>}
             {canSeeExams && <Link to="/exam-generator" className="text-gray-700 font-medium hover:text-blue-700 hidden md:block">الامتحانات</Link>}
             
             {user ? (
                 <button onClick={handleLogout} className="bg-red-600 text-white p-2 rounded-full flex items-center gap-2 px-4 shadow-md">
                    <LogOut size={18} />
                    <span className="text-xs font-bold hidden md:inline">خروج</span>
                 </button>
             ) : (
                 <Link to="/login" className="bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-blue-700">
                    <Lock size={18} />
                 </Link>
             )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-white -z-20"></div>
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
          <div className="text-right space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
               <Award size={16} />
               <span>{config.jobTitle}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
              {config.heroTitle} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-purple-600">
                {config.heroSubtitle}
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">{config.heroDescription}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#tools" onClick={handleScrollToTools} className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-1">ابدأ الآن</a>
              <div className="flex gap-3">
                 {config.socialLinks.linkedin.visible && <a href={config.socialLinks.linkedin.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><Linkedin size={20} /></a>}
                 {config.socialLinks.facebook.visible && <a href={config.socialLinks.facebook.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><Facebook size={20} /></a>}
                 {config.socialLinks.instagram && config.socialLinks.instagram.visible && <a href={config.socialLinks.instagram.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><Instagram size={20} /></a>}
                 {config.socialLinks.threads && config.socialLinks.threads.visible && <a href={config.socialLinks.threads.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><AtSign size={20} /></a>}
                 {config.socialLinks.tiktok && config.socialLinks.tiktok.visible && <a href={config.socialLinks.tiktok.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><TikTokIcon size={20} /></a>}
                 {config.socialLinks.youtube.visible && <a href={config.socialLinks.youtube.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><Youtube size={20} /></a>}
                 {config.socialLinks.email.visible && <a href={config.socialLinks.email.url} className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 transition"><Mail size={20} /></a>}
              </div>
            </div>
          </div>
          <div className="flex justify-center relative">
             <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-6 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gray-200 flex items-center justify-center">
                   {config.showProfileImage ? (
                       <img src={config.profileImage} alt={config.heroSubtitle} className="w-full h-full object-cover" />
                   ) : (
                       <User size={120} className="text-gray-300" />
                   )}
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-gray-900 text-white">
         <div className="container mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold mb-4">أدوات المنصة الذكية</h2>
               <p className="text-gray-400">اختر الأداة التعليمية المناسبة لك</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
               {canSeeExams && <ToolCard to="/exam-generator" icon={<FileText size={40} />} title="نظام الامتحانات" color="blue" />}
               {canSeeExams && <ToolCard to="/omr-grader" icon={<Activity size={40} />} title="التصحيح الآلي" color="green" />}
               {canSeeMath && <ToolCard to="/math-assistant" icon={<Sigma size={40} />} title="مساعد الرياضيات" color="orange" />}
               {canSeeEmail && <ToolCard to="/email-sender" icon={<Mail size={40} />} title="نظام المراسلات" color="cyan" />}
               {canSeeCourses && <ToolCard to="/courses" icon={<PlayCircle size={40} />} title="منصة الدورات" color="purple" />}
            </div>
         </div>
      </section>

      <footer className="bg-white border-t py-8 mt-auto text-center">
         <p className="text-gray-500 text-sm">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - {config.heroSubtitle}</p>
      </footer>
    </div>
  );
};

const ToolCard = ({ to, icon, title, color }: any) => (
  <Link to={to} className="group relative bg-gray-800 rounded-3xl p-8 flex flex-col items-center text-center border border-gray-700 hover:border-blue-500 transition duration-300">
    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gray-900 transition group-hover:scale-110`}>
        {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <span className="mt-4 font-bold text-sm flex items-center gap-2 group-hover:text-blue-400">تشغيل الأداة <Send size={16} /></span>
  </Link>
);

export default LandingPage;
