// App.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HomePage from './components/HomePage';
import { ensureAdminExists } from './src/auth';  // ← ADD THIS LINE

import Dashboard from './components/Dashboard';
import CourseView from './components/CourseView';
import Header from './components/Header';
import Footer from './components/Footer';
import AiTutor from './components/AiTutor';
import UserChat from './components/UserChat';
import AdminLayout from './components/AdminLayout';
import LiveStudio from './components/LiveStudio';
import { CourseProvider } from './context/CourseContext';
import { CourseDataProvider } from './context/CourseDataContext';
import { AppUser, AiChatMessage, AdminCredentials } from './types';
import {
  getOrCreateUserProfile,
  loginAsAdmin,
  fetchCurrentUserProfile,
  fetchAllStudentUsersDB,
  updateUserName,
  updateUserAvatar,
  updateAdminProfile,
  updateAdminPassword,
  updateChatHistory,
  logoutUser,
} from './dbService';

export enum View {
  Dashboard,
  Course,
  LiveStudio,
}

export enum AdminView {
  Dashboard,
  Content,
  Assignments,
  Profile,
  Chat,
  LiveStudio,
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allStudents, setAllStudents] = useState<AppUser[]>([]);

  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [adminView, setAdminView] = useState<AdminView>(AdminView.Dashboard);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);

  const isLoggedIn = !!currentUser;
  const currentUserId = currentUser?.id ?? null;
  const isAdmin = currentUser?.role === 'ADMIN';

  const adminCredentials: AdminCredentials | null = useMemo(() => {
    if (isAdmin && currentUser) {
      return { email: currentUser.email, pass: '**********', name: currentUser.name };
    }
    return null;
  }, [isAdmin, currentUser]);

  // Auth listener
   // REMOVE ALL SUPABASE AUTH LISTENER — WE DON'T HAVE SESSIONS ANYMORE
  // Replace the whole useEffect(() => { const checkSession = async... }) with this:

  useEffect(() => {
    // Simple page-load check: do we have a user in localStorage?
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);

    // Auto-create admin user on first visit (only runs once)
    ensureAdminExists().then(() => {
      console.log('Admin user ready');
    });
  }, []);

  // Load students
  useEffect(() => {
    if (isAdmin) {
      fetchAllStudentUsersDB().then(setAllStudents);
    } else {
      setAllStudents([]);
    }
  }, [isAdmin]);

  const handleLogin = useCallback(async (email: string, pass: string, isSignup: boolean, name: string) => {
    const user = await getOrCreateUserProfile(email, name, pass, isSignup);
    if (user) {
      setCurrentUser(user);
      setCurrentView(View.Dashboard);
    } else {
      alert('Authentication failed');
    }
  }, []);

   const handleAdminLogin = useCallback(async (email: string, pass: string) => {
    const adminUser = await loginAsAdmin(email, pass);
    if (adminUser) {
      setCurrentUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));  // ← persist
      setAdminView(AdminView.Dashboard);
    } else {
      alert('Invalid admin credentials');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutUser(); // if you still have this, or just remove it
    setCurrentUser(null);
    localStorage.removeItem('currentUser');  // ← clear
    setCurrentView(View.Dashboard);
    setAdminView(AdminView.Dashboard);
  }, []);

  // ... (rest of handlers unchanged)

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (isAdmin && currentUser) {
      if (adminView === AdminView.LiveStudio) {
        return <LiveStudio currentUser={currentUser} currentUserEmail={currentUser.email} isAdmin={true} onExit={() => setAdminView(AdminView.Dashboard)} />;
      }
      return (
        <CourseDataProvider>
          <Header onLogout={handleLogout} isAdmin={true} userName={currentUser.name} onNavigateToLiveStudio={() => setAdminView(AdminView.LiveStudio)} />
          <AdminLayout adminView={adminView} setAdminView={setAdminView} adminCredentials={adminCredentials} allStudents={allStudents} />
        </CourseDataProvider>
      );
    }

    if (isLoggedIn && currentUser) {
      if (currentView === View.LiveStudio) {
        return <LiveStudio currentUser={currentUser} currentUserEmail={currentUser.email} isAdmin={false} onExit={() => setCurrentView(View.Dashboard)} />;
      }
      return (
        <CourseDataProvider>
          <CourseProvider userId={currentUser.id}>
            <Header onLogout={handleLogout} isAdmin={false} userName={currentUser.name} userAvatar={currentUser.avatar} onNavigateToLiveStudio={() => setCurrentView(View.LiveStudio)} />
            <main className="flex-grow container mx-auto px-4 py-8">
              {currentView === View.Dashboard && <Dashboard userName={currentUser.name} />}
              {currentView === View.Course && <CourseView weekIndex={selectedWeek} onBack={() => setCurrentView(View.Dashboard)} userEmail={currentUser.email} />}
            </main>
            <Footer />
            <AiTutor initialChatHistory={currentUser.chatHistory} onUpdateChatHistory={(h) => updateChatHistory(currentUser.id, h)} />
            <UserChat userEmail={currentUser.email} userName={currentUser.name} />
          </CourseProvider>
        </CourseDataProvider>
      );
    }

    return <HomePage onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      {renderContent()}
    </div>
  );
};

export default App;