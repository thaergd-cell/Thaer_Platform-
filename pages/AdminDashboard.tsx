
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Plus, Trash, Save, Video, FileText, Image as ImageIcon, LogOut, Home, Layout, BookOpen, Download, Upload, Users, Settings, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Course, Lesson, LandingPageConfig, User, SystemSettings } from '../types';
import { getCourses, saveCourses, saveCourse, deleteCourse, getLandingConfig, saveLandingConfig, getUsers, saveUsers, getSystemSettings, saveSystemSettings, loginUser, logoutUser, getCurrentUser } from '../utils/storage';

const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState(''); 
  const navigate = useNavigate();
  const location = useLocation();

  // الحصول على المسار الذي كان يحاول المستخدم الوصول إليه قبل طلب تسجيل الدخول
  const from = (location.state as any)?.from?.pathname || null;

  useEffect(() => {
      const user = getCurrentUser();
      if (user) {
          handlePostLoginNavigation(user);
      }
  }, [navigate]);

  const handlePostLoginNavigation = (user: User) => {
      // إذا كان هناك مسار محدد سابقاً (مثل /exam-generator) نذهب إليه مباشرة
      if (from && from !== '/admin' && from !== '/login') {
          navigate(from, { replace: true });
          return;
      }

      // توجيه تلقائي بناءً على الدور والصلاحيات إذا لم يكن هناك مسار محدد
      if (user.role === 'admin') {
          setIsLoggedIn(true);
      } else {
          if (user.permissions.canAccessExam) navigate('/exam-generator', { replace: true });
          else if (user.permissions.canAccessCourses) navigate('/courses', { replace: true });
          else navigate('/', { replace: true });
      }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      loginUser(user, rememberMe);
      handlePostLoginNavigation(user);
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
      logoutUser();
      setIsLoggedIn(false);
      navigate('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-tajawal p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <Lock size={36} className="text-blue-900" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
            <p className="text-gray-500 text-sm mt-1">يرجى إدخال بياناتك للوصول إلى الأدوات</p>
          </div>
          
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 text-sm animate-shake">
                <AlertCircle size={20} />
                <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all ${loginError ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all ${loginError ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            checked={rememberMe} 
                            onChange={e => setRememberMe(e.target.checked)} 
                            className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded transition-colors flex items-center justify-center ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                            {rememberMe && <CheckCircle size={14} className="text-white" />}
                        </div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition">تذكرني على هذا الجهاز</span>
                </label>
            </div>

            <button type="submit" className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20">دخول للنظام</button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-6">
              <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition flex items-center gap-1"><Home size={14}/> الرئيسية</Link>
          </div>
        </form>
      </div>
    );
  }

  return <DashboardContent onLogout={handleLogout} />;
};

const DashboardContent: React.FC<{onLogout: () => void}> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'courses' | 'landing' | 'users' | 'system'>('courses');
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(getSystemSettings());
    const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(getLandingConfig());
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [newUser, setNewUser] = useState<Partial<User>>({ 
      role: 'user', 
      permissions: { canAccessCourses: true, canAccessExam: false, canAccessEmail: false } 
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCourses(getCourses());
        setUsers(getUsers());
        setSystemSettings(getSystemSettings());
    }, []);

    const handleAddUser = () => {
        if (!newUser.username || !newUser.password) return alert('يرجى ملء الحقول المطلوبة');
        if (users.some(u => u.username === newUser.username)) return alert('اسم المستخدم موجود مسبقاً');
        
        const userToAdd: User = {
            id: Date.now().toString(),
            username: newUser.username,
            password: newUser.password,
            fullName: newUser.fullName || 'مستخدم جديد',
            role: 'user',
            permissions: (newUser.permissions as User['permissions']) || { canAccessExam: false, canAccessCourses: false, canAccessEmail: false }
        };
        const updatedUsers = [...users, userToAdd];
        saveUsers(updatedUsers);
        setUsers(updatedUsers);
        
        setNewUser({ 
          role: 'user', 
          permissions: { canAccessCourses: true, canAccessExam: false, canAccessEmail: false }, 
          username: '', 
          password: '', 
          fullName: '' 
        });
    };
    const handleDeleteUser = (id: string) => {
        if (id === 'admin') return alert('لا يمكن حذف المدير الرئيسي');
        if (confirm('هل أنت متأكد من حذف المستخدم؟')) {
            const updated = users.filter(u => u.id !== id);
            saveUsers(updated);
            setUsers(updated);
        }
    };
    const handleSaveSystem = () => { saveSystemSettings(systemSettings); alert('تم حفظ إعدادات النظام'); };
    const handleExportData = () => {
        const data = { courses: getCourses(), landingConfig: getLandingConfig(), users: getUsers(), systemSettings: getSystemSettings() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `thaer_platform_backup.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };
    const handleImportClick = () => { fileInputRef.current?.click(); };
    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.courses) { saveCourses(json.courses); setCourses(json.courses); }
                if (json.landingConfig) { saveLandingConfig(json.landingConfig); setLandingConfig(json.landingConfig); }
                if (json.users) { saveUsers(json.users); setUsers(json.users); }
                if (json.systemSettings) { saveSystemSettings(json.systemSettings); setSystemSettings(json.systemSettings); }
                alert('تم استيراد البيانات بنجاح!');
            } catch (err) { alert('فشل قراءة الملف.'); }
            e.target.value = '';
        };
        reader.readAsText(file);
    };
    const handleSaveCourse = () => { if (!editingCourse) return; if (!editingCourse.title.trim()) return alert('الرجاء إدخال عنوان الدورة'); saveCourse(editingCourse); setCourses(getCourses()); setEditingCourse(null); };
    const handleDeleteCourse = (id: string) => { if (confirm('هل أنت متأكد من حذف الدورة؟')) { deleteCourse(id); setCourses(getCourses()); } };
    const addNewCourse = () => { setEditingCourse({ id: Date.now().toString(), title: 'دورة جديدة', description: '', lessons: [] }); };
    const handleSaveLandingConfig = () => { saveLandingConfig(landingConfig); alert('تم حفظ إعدادات الصفحة الرئيسية بنجاح'); };
    const toggleSocialVisibility = (key: keyof LandingPageConfig['socialLinks']) => { setLandingConfig(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: { ...prev.socialLinks[key], visible: !prev.socialLinks[key].visible } } })); };
    const updateSocialUrl = (key: keyof LandingPageConfig['socialLinks'], url: string) => { setLandingConfig(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: { ...prev.socialLinks[key], url } } })); };
    const addLesson = () => { if (!editingCourse) return; setEditingCourse({ ...editingCourse, lessons: [...editingCourse.lessons, { id: Date.now().toString(), title: 'درس جديد', type: 'video', content: '' }] }); };
    const updateLesson = (index: number, field: keyof Lesson, value: string) => { if (!editingCourse) return; const updatedLessons = [...editingCourse.lessons]; (updatedLessons[index] as any)[field] = value; setEditingCourse({ ...editingCourse, lessons: updatedLessons }); };
    const removeLesson = (index: number) => { if (!editingCourse) return; setEditingCourse({ ...editingCourse, lessons: editingCourse.lessons.filter((_, i) => i !== index) }); };

    return (
        <div className="min-h-screen bg-gray-50 font-tajawal flex flex-col">
           <nav className="bg-gray-900 text-white p-4 sticky top-0 z-50 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
              <span className="font-bold text-xl">لوحة التحكم الشاملة</span>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 ml-4 border-l border-gray-700 pl-4">
                    <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" accept=".json" />
                    <button onClick={handleImportClick} className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 border border-gray-700"><Upload size={14} /> استيراد</button>
                    <button onClick={handleExportData} className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-gray-300 border border-gray-700"><Download size={14} /> تصدير</button>
                </div>
                <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white"><Home size={18}/> الموقع</Link>
                <button onClick={onLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100"><LogOut size={18}/> خروج</button>
              </div>
            </div>
          </nav>
    
          <div className="container mx-auto p-6 flex-grow">
            <div className="flex flex-wrap gap-2 mb-8 border-b pb-1">
                <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookOpen size={18} />} label="إدارة الدورات" />
                <TabButton active={activeTab === 'landing'} onClick={() => setActiveTab('landing')} icon={<Layout size={18} />} label="الصفحة الرئيسية" />
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} label="المستخدمين" />
                <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Settings size={18} />} label="إعدادات النظام" />
            </div>
    
            {activeTab === 'courses' && !editingCourse && (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">إدارة الدورات ({courses.length})</h2>
                        <button onClick={addNewCourse} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"><Plus size={20} /> إضافة دورة</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                <p className="text-gray-500 text-sm mb-4 h-10 overflow-hidden">{course.description || 'لا يوجد وصف'}</p>
                                <div className="flex gap-2 pt-4 border-t">
                                    <button onClick={() => setEditingCourse(course)} className="flex-1 bg-blue-50 text-blue-600 py-1 rounded hover:bg-blue-100">تعديل</button>
                                    <button onClick={() => handleDeleteCourse(course.id)} className="flex-1 bg-red-50 text-red-600 py-1 rounded hover:bg-red-100">حذف</button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
            {activeTab === 'courses' && editingCourse && (
                 <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-xl font-bold text-blue-900">تعديل الدورة</h3>
                        <div className="flex gap-2"><button onClick={() => setEditingCourse(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">إلغاء</button><button onClick={handleSaveCourse} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"><Save size={18}/> حفظ</button></div>
                    </div>
                    <div className="space-y-4"><input type="text" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full p-2 border rounded" placeholder="عنوان الدورة" />
                    <textarea value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} className="w-full p-2 border rounded" placeholder="وصف الدورة" />
                    <div className="bg-gray-50 p-4 rounded">
                        <div className="flex justify-between mb-2"><h4 className="font-bold">الدروس</h4><button onClick={addLesson} className="text-sm text-blue-600">+ درس</button></div>
                        {editingCourse.lessons.map((l, i) => <div key={l.id} className="flex gap-2 mb-2"><input value={l.title} onChange={e => updateLesson(i, 'title', e.target.value)} className="p-1 border rounded flex-1" /><button onClick={() => removeLesson(i)} className="text-red-500"><Trash size={14}/></button></div>)}
                    </div>
                    </div>
                 </div>
            )}
            {activeTab === 'landing' && (
                 <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                     <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="text-xl font-bold text-blue-900">تعديل الرئيسية</h3><button onClick={handleSaveLandingConfig} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Save size={18}/> حفظ</button></div>
                     <div className="space-y-4">
                         <input value={landingConfig.heroTitle} onChange={e => setLandingConfig({...landingConfig, heroTitle: e.target.value})} className="w-full p-2 border rounded" placeholder="العنوان" />
                         <label className="flex items-center gap-2"><input type="checkbox" checked={landingConfig.showProfileImage} onChange={e => setLandingConfig({...landingConfig, showProfileImage: e.target.checked})} /> إظهار الصورة الشخصية</label>
                     </div>
                 </div>
            )}
            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">المستخدمين</h3>
                    <div className="bg-blue-50 p-4 mb-4 rounded flex gap-4 flex-wrap">
                        <input placeholder="اسم المستخدم" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="p-2 border rounded" />
                        <input placeholder="كلمة المرور" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="p-2 border rounded" />
                        <button onClick={handleAddUser} className="bg-blue-600 text-white px-4 py-2 rounded">إضافة</button>
                    </div>
                    <div>{users.map(u => <div key={u.id} className="flex justify-between border-b p-2"><span>{u.username} ({u.role})</span>{u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="text-red-500"><Trash size={14}/></button>}</div>)}</div>
                </div>
            )}
            {activeTab === 'system' && (
                <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                     <h3 className="text-xl font-bold text-red-900 mb-4"><Shield className="inline" size={20}/> إعدادات النظام</h3>
                     <div className="space-y-4">
                         <label className="flex gap-2"><input type="checkbox" checked={systemSettings.isExamSystemLocked} onChange={e => setSystemSettings({...systemSettings, isExamSystemLocked: e.target.checked})} /> قفل الامتحانات</label>
                         <label className="flex gap-2"><input type="checkbox" checked={systemSettings.isCoursesSystemLocked} onChange={e => setSystemSettings({...systemSettings, isCoursesSystemLocked: e.target.checked})} /> قفل الدورات</label>
                         <button onClick={handleSaveSystem} className="bg-red-600 text-white px-4 py-2 rounded">حفظ الإعدادات</button>
                     </div>
                </div>
            )}
          </div>
        </div>
      );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
        {icon} {label}
    </button>
);

export default AdminDashboard;
