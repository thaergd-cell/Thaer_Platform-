
import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { getCurrentUser, getSystemSettings } from '../utils/storage';
import { Lock } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  section: 'admin' | 'exam' | 'courses' | 'email' | 'math';
}

const ProtectedRoute: React.FC<Props> = ({ children, section }) => {
  const user = getCurrentUser();
  const settings = getSystemSettings();
  const location = useLocation();

  // 1. ADMIN ACCESS
  if (section === 'admin') {
      if (!user) {
          return <Navigate to="/login" state={{ from: location }} replace />;
      }
      if (user.role !== 'admin') {
          return (
              <div className="min-h-screen flex items-center justify-center bg-gray-100 font-tajawal">
                  <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                      <Lock size={48} className="mx-auto text-red-500 mb-4" />
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">وصول مرفوض</h2>
                      <p className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة التحكم.</p>
                      <Link to="/" className="block mt-6 text-blue-600 hover:underline">عودة للرئيسية</Link>
                  </div>
              </div>
          );
      }
      return <>{children}</>;
  }

  // 2. PUBLIC SECTIONS
  const isLocked = section === 'exam' ? settings.isExamSystemLocked : (section === 'courses' ? settings.isCoursesSystemLocked : false);
  
  if (isLocked) {
      if (!user) {
           return (
              <div className="min-h-screen flex items-center justify-center bg-gray-100 font-tajawal">
                  <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md border-t-4 border-red-500">
                      <Lock size={48} className="mx-auto text-gray-400 mb-4" />
                      <h2 className="text-xl font-bold text-gray-800 mb-2">النظام مغلق</h2>
                      <p className="text-gray-600 mb-6">{settings.lockMessage}</p>
                      <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition inline-flex items-center gap-2">
                          تسجيل الدخول
                      </Link>
                      <Link to="/" className="block mt-4 text-sm text-gray-500 hover:underline">عودة للرئيسية</Link>
                  </div>
              </div>
          );
      }
  }

  // Always check permissions if logged in
  if (user) {
      let hasPermission = false;
      if (user.role === 'admin') hasPermission = true;
      else if (section === 'exam') hasPermission = user.permissions.canAccessExam;
      else if (section === 'courses') hasPermission = user.permissions.canAccessCourses;
      else if (section === 'email') hasPermission = user.permissions.canAccessEmail;
      else if (section === 'math') hasPermission = user.permissions.canAccessMath || user.permissions.canAccessExam; // Math is often for exam prep

      if (!hasPermission) {
          return (
              <div className="min-h-screen flex items-center justify-center bg-gray-100 font-tajawal">
                  <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
                      <h2 className="text-xl font-bold text-red-600 mb-2">عفواً</h2>
                      <p className="text-gray-600">حسابك لا يملك صلاحية الدخول لهذا القسم حالياً.</p>
                      <Link to="/" className="block mt-6 text-blue-600 hover:underline">عودة للرئيسية</Link>
                  </div>
              </div>
          );
      }
  } else if (section === 'email' || section === 'exam' || section === 'courses' || section === 'math') {
      return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
