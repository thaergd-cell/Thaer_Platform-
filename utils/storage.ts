
import { Course, LandingPageConfig, User, SystemSettings } from '../types';

const COURSES_KEY = 'thaer_platform_courses';
const LANDING_KEY = 'thaer_platform_landing_config';
const USERS_KEY = 'thaer_platform_users';
const SYSTEM_SETTINGS_KEY = 'thaer_platform_system_settings';
const PERSISTED_USER_KEY = 'thaer_persisted_user';
const SESSION_USER_KEY = 'thaer_current_user';

const kamelUser: User = {
    id: 'kamel_user',
    username: 'kamel',
    password: 'kamel1',
    role: 'user',
    fullName: 'كامل (نظام المراسلات)',
    permissions: { 
      canAccessExam: false, 
      canAccessCourses: false, 
      canAccessEmail: true,
      canAccessMath: false
    }
};

export const getCourses = (): Course[] => {
  try {
    const stored = localStorage.getItem(COURSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const saveCourses = (courses: Course[]) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

export const saveCourse = (course: Course) => {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === course.id);
  if (index >= 0) {
    courses[index] = course;
  } else {
    courses.push(course);
  }
  saveCourses(courses);
};

export const deleteCourse = (id: string) => {
  const courses = getCourses();
  const updated = courses.filter(c => c.id !== id);
  saveCourses(updated);
};

export const getLandingConfig = (): LandingPageConfig => {
  const defaultLandingConfig: LandingPageConfig = {
    heroTitle: 'أهلاً بك في صفحة المحاضر',
    heroSubtitle: 'ثائر مصلح أبو قبيطة',
    heroDescription: 'نقدم حلولاً رقمية متكاملة للارتقاء بالعملية التعليمية.',
    profileImage: 'https://i.postimg.cc/hGsTCCd3/Thaer.jpg',
    showProfileImage: true,
    yearsOfExperience: '+14 عاماً',
    bioTitle: 'السيرة الذاتية',
    bioText: 'دكتوراه في الوسائط المتعددة، مدرب دولي ومستشار.',
    jobTitle: 'محاضر، مدرب ومستشار',
    location: 'فلسطين',
    email: 'thar_m@ppu.edu',
    socialLinks: {
      linkedin: { url: 'https://www.linkedin.com/in/thaer-mesleh-abq', visible: true },
      twitter: { url: '#', visible: false },
      facebook: { url: 'https://www.facebook.com/thar.qobaitah/', visible: true },
      youtube: { url: 'https://www.youtube.com/@thaer_abq', visible: true },
      instagram: { url: 'https://www.instagram.com/thaer_abq', visible: true },
      threads: { url: 'https://www.threads.com/@thaer_abq', visible: true },
      tiktok: { url: 'https://www.tiktok.com/@thaer_abq', visible: true },
      email: { url: 'mailto:thar_m@ppu.edu', visible: true }
    }
  };
  try {
    const stored = localStorage.getItem(LANDING_KEY);
    // Backward compatibility check
    const parsed = stored ? JSON.parse(stored) : defaultLandingConfig;
    if (!parsed.socialLinks.threads) {
      parsed.socialLinks.threads = defaultLandingConfig.socialLinks.threads;
    }
    if (!parsed.socialLinks.tiktok) {
      parsed.socialLinks.tiktok = defaultLandingConfig.socialLinks.tiktok;
    }
    return parsed;
  } catch (e) {
    return defaultLandingConfig;
  }
};

export const saveLandingConfig = (config: LandingPageConfig) => {
  localStorage.setItem(LANDING_KEY, JSON.stringify(config));
};

export const getUsers = (): User[] => {
    try {
        const stored = localStorage.getItem(USERS_KEY);
        if (stored) {
            const parsed: User[] = JSON.parse(stored);
            if (!parsed.some(u => u.username === 'kamel')) {
                const updated = [...parsed, kamelUser];
                localStorage.setItem(USERS_KEY, JSON.stringify(updated));
                return updated;
            }
            parsed.forEach(u => {
              if(u.role === 'admin' && u.permissions.canAccessMath === undefined) {
                u.permissions.canAccessMath = true;
              }
            });
            return parsed;
        }
        const initialUsers: User[] = [
          {
            id: 'admin',
            username: 'admin',
            password: 'adminadmin',
            role: 'admin',
            fullName: 'المدير العام',
            permissions: { canAccessExam: true, canAccessCourses: true, canAccessEmail: true, canAccessMath: true }
          },
          kamelUser
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    } catch {
        return [kamelUser];
    }
};

export const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSystemSettings = (): SystemSettings => {
    const defaultSettings: SystemSettings = {
        isExamSystemLocked: false,
        isCoursesSystemLocked: false,
        lockMessage: 'النظام قيد الصيانة.'
    };
    try {
        const stored = localStorage.getItem(SYSTEM_SETTINGS_KEY);
        return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
        return defaultSettings;
    }
};

export const saveSystemSettings = (settings: SystemSettings) => {
    localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(settings));
};

export const getCurrentUser = (): User | null => {
  const session = sessionStorage.getItem(SESSION_USER_KEY);
  if (session) return JSON.parse(session);
  
  const persisted = localStorage.getItem(PERSISTED_USER_KEY);
  if (persisted) return JSON.parse(persisted);
  
  return null;
};

export const loginUser = (user: User, rememberMe: boolean = false) => {
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  if (rememberMe) {
    localStorage.setItem(PERSISTED_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(PERSISTED_USER_KEY);
  }
};

export const logoutUser = () => {
  sessionStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(PERSISTED_USER_KEY);
};
