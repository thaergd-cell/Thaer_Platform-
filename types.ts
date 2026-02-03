
export interface ExamDetails {
  university: string;
  college: string;
  department: string;
  examName: string;
  examType: string;
  duration: string;
  date: string;
  logo?: string | null;
}

export interface ExamStyle {
  fontFamily: 'Tajawal' | 'Amiri' | 'Cairo' | 'IBM Plex Sans Arabic';
  columns: 1 | 2;
  answerLayout: 'auto' | 'vertical' | 'grid';
  headerColor: string;
  questionColor: string;
  baseFontSize: 'sm' | 'base' | 'lg';
  headerSizes: {
    university: string;
    college: string;
    department: string;
    examName: string;
  };
  showColumnDivider: boolean;
  questionStyle: 'simple' | 'boxed' | 'zebra';
  showAnswerKey: boolean;
  showStudentAnswerSheet?: boolean;
  showStudentId?: boolean;
  textDirection: 'rtl' | 'ltr';
  showFooter?: boolean;
  footerText?: string;
}

export interface Answer {
  id: string;
  text: string;
  fraction: number;
  feedback?: string;
}

export type QuestionType = 'multichoice' | 'essay' | 'shortanswer' | 'truefalse';

export interface Question {
  id: string;
  name: string;
  text: string;
  type: string;
  visualType?: QuestionType;
  layout?: 'columns' | 'full';
  mark: number;
  answers: Answer[];
  essayLines?: number;
  correctAnswerText?: string;
}

export interface ParsedExam {
  questions: Question[];
  error?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  permissions: {
    canAccessExam: boolean;
    canAccessCourses: boolean;

    canAccessEmail: boolean;
    canAccessMath?: boolean;
  };
  fullName: string;
}

export interface SystemSettings {
  isExamSystemLocked: boolean;
  isCoursesSystemLocked: boolean;
  lockMessage: string;
}

export interface EmailRecipient {
  email: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

export interface EmailCampaign {
  senderEmail: string;
  senderPassword: string;
  subject: string;
  body: string;
  recipients: EmailRecipient[];
}

// Course system types
export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'image';
  content: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  thumbnail?: string;
}

// Landing page configuration type
export interface LandingPageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  profileImage: string;
  showProfileImage: boolean;
  yearsOfExperience: string;
  bioTitle: string;
  bioText: string;
  jobTitle: string;
  location: string;
  email: string;
  socialLinks: {
    linkedin: { url: string; visible: boolean };
    twitter: { url: string; visible: boolean };
    facebook: { url: string; visible: boolean };
    youtube: { url: string; visible: boolean };
    instagram: { url: string; visible: boolean };
    threads: { url: string; visible: boolean };
    tiktok: { url: string; visible: boolean };
    email: { url: string; visible: boolean };
  };
}

// OMR system types
export type OmrAnswers = Record<string, string>;

export interface StudentOmrResult {
  id: string;
  imageName: string;
  studentName: string;
  studentId: string;
  answers: OmrAnswers;
  score: number;
  totalQuestions: number;
  details: {
    qNum: string;
    studentAns: string;
    correctAns: string;
    isCorrect: boolean;
  }[];
}