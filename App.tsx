
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ExamGenerator from './pages/ExamGenerator';
import OmrGrader from './pages/OmrGrader';
import MathAssistant from './pages/MathAssistant';
import EmailSender from './pages/EmailSender';
import CoursesPage from './pages/CoursesPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route path="/" element={<LandingPage />} />
        
        {/* تسجيل الدخول */}
        <Route path="/login" element={<AdminDashboard />} />

        {/* الأدوات - محمية بكلمة مرور وصلاحيات */}
        <Route path="/exam-generator" element={
          <ProtectedRoute section="exam">
            <ExamGenerator />
          </ProtectedRoute>
        } />
        
        <Route path="/omr-grader" element={
          <ProtectedRoute section="exam">
            <OmrGrader />
          </ProtectedRoute>
        } />

        <Route path="/math-assistant" element={
          <ProtectedRoute section="math">
            <MathAssistant />
          </ProtectedRoute>
        } />

        <Route path="/email-sender" element={
          <ProtectedRoute section="email">
            <EmailSender />
          </ProtectedRoute>
        } />

        <Route path="/courses" element={
          <ProtectedRoute section="courses">
            <CoursesPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute section="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* إعادة توجيه أي مسار خاطئ للرئيسية */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
