import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Home, PlayCircle, FileText, Image as ImageIcon, ChevronLeft, LogOut } from 'lucide-react';
import { getCourses, logoutUser } from '../utils/storage';
import { Course, Lesson } from '../types';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const handleLogout = () => {
      logoutUser();
      navigate('/');
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    if (course.lessons.length > 0) {
      setSelectedLesson(course.lessons[0]);
    } else {
      setSelectedLesson(null);
    }
  };

  // Helper to robustly convert YouTube URLs to Embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle various YouTube URL formats:
    // - https://www.youtube.com/watch?v=ID
    // - https://youtu.be/ID
    // - https://www.youtube.com/embed/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    // Fallback if regex fails but it looks like a youtube link, try simple replace
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return url.replace('watch?v=', 'embed/');
    }

    return url;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-tajawal flex flex-col">
      <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-purple-900">
            <GraduationCap size={28} />
            <span className="font-bold text-lg">منصة الدورات التدريبية</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700 transition">
                <Home size={18} /> الرئيسية
            </Link>
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
            >
                <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!selectedCourse ? (
          // Course List View
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">الدورات المتاحة</h2>
            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-500 text-lg">لا توجد دورات متاحة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div 
                    key={course.id} 
                    onClick={() => handleCourseClick(course)}
                    className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden group"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-400">
                          <PlayCircle size={48} />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {course.lessons.length} درس
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-2 text-gray-800 group-hover:text-purple-700 transition">{course.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Single Course View
          <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* Sidebar Lessons */}
            <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-purple-50">
                <button onClick={() => setSelectedCourse(null)} className="text-xs text-purple-700 flex items-center gap-1 mb-2 hover:underline">
                   <ChevronLeft size={14} /> العودة للدورات
                </button>
                <h3 className="font-bold text-gray-800">{selectedCourse.title}</h3>
              </div>
              <div className="flex-grow overflow-y-auto p-2 space-y-1">
                {selectedCourse.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-right p-3 rounded-lg flex items-center gap-3 transition ${selectedLesson?.id === lesson.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <span className="text-xs opacity-70 w-4">{idx + 1}.</span>
                    {lesson.type === 'video' && <PlayCircle size={16} />}
                    {lesson.type === 'text' && <FileText size={16} />}
                    {lesson.type === 'image' && <ImageIcon size={16} />}
                    <span className="text-sm font-medium truncate">{lesson.title}</span>
                  </button>
                ))}
                {selectedCourse.lessons.length === 0 && <p className="text-center text-sm text-gray-400 py-4">لا توجد دروس</p>}
              </div>
            </div>

            {/* Content Viewer */}
            <div className="w-full lg:w-3/4 bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
              {selectedLesson ? (
                <div className="flex-grow overflow-y-auto">
                   <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">{selectedLesson.title}</h2>
                      
                      {selectedLesson.type === 'video' && (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-6">
                          <iframe 
                            src={getEmbedUrl(selectedLesson.content)} 
                            title={selectedLesson.title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}

                      {selectedLesson.type === 'image' && (
                         <div className="mb-6 rounded-xl overflow-hidden border">
                            <img src={selectedLesson.content} alt={selectedLesson.title} className="w-full h-auto" />
                         </div>
                      )}

                      {selectedLesson.type === 'text' && (
                        <div className="prose max-w-none bg-gray-50 p-6 rounded-xl border">
                           <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{selectedLesson.content}</p>
                        </div>
                      )}
                      
                   </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                   <PlayCircle size={64} className="opacity-20 mb-4" />
                   <p>اختر درساً من القائمة لبدء المشاهدة</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesPage;