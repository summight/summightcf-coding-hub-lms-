import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
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
import { User, AdminCredentials, AiChatMessage } from './types';

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

// Moved outside component to be used in useState initializer
const getAllUsers = (): Record<string, User> => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [adminView, setAdminView] = useState<AdminView>(AdminView.Dashboard);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<Record<string, User>>(getAllUsers);

  const getAdminCredentials = (): AdminCredentials | null => {
      const creds = localStorage.getItem('adminCredentials');
      return creds ? JSON.parse(creds) : null;
  };

  useEffect(() => {
    // Seed admin credentials if they don't exist
    if (!getAdminCredentials()) {
        localStorage.setItem('adminCredentials', JSON.stringify({
            email: 'admin@summightcf.com.ng',
            pass: 'admin123',
            name: 'Admin User'
        }));
    }

    const loggedInUserEmail = localStorage.getItem('currentUserEmail');
    const adminStatus = localStorage.getItem('isAdminLoggedIn');
    
    if (adminStatus === 'true') {
        setIsAdminLoggedIn(true);
    } 
    
    if (loggedInUserEmail) {
      setCurrentUserEmail(loggedInUserEmail);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (email: string, name: string) => {
    const users = { ...allUsers };
    if (!users[email]) {
        users[email] = { name, progress: {}, avatar: '', chatHistory: [] };
        localStorage.setItem('users', JSON.stringify(users));
        setAllUsers(users);
    }
    
    setIsLoggedIn(true);
    setCurrentUserEmail(email);
    localStorage.setItem('currentUserEmail', email);
    setCurrentView(View.Dashboard);
  };
  
  const handleAdminLogin = (email: string, pass: string) => {
    const adminCreds = getAdminCredentials();
    if (adminCreds && email === adminCreds.email && pass === adminCreds.pass) {
        setIsAdminLoggedIn(true);
        localStorage.setItem('isAdminLoggedIn', 'true');
        setAdminView(AdminView.Dashboard); // Ensure dashboard is shown on login
    } else {
        alert('Invalid admin credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    setCurrentUserEmail(null);
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('isAdminLoggedIn');
  };

  const handleUpdateAdminProfile = (name: string, email: string): boolean => {
      const adminCreds = getAdminCredentials();
      if (adminCreds) {
          const updatedCreds = { ...adminCreds, name, email };
          localStorage.setItem('adminCredentials', JSON.stringify(updatedCreds));
          return true;
      }
      return false;
  };

  const handleUpdateAdminPassword = (newPass: string): boolean => {
       const adminCreds = getAdminCredentials();
      if (adminCreds) {
          const updatedCreds = { ...adminCreds, pass: newPass };
          localStorage.setItem('adminCredentials', JSON.stringify(updatedCreds));
          return true;
      }
      return false;
  }
  
  const handleSetUserName = (name: string) => {
    if (currentUserEmail) {
        const users = { ...allUsers };
        if (users[currentUserEmail]) {
            users[currentUserEmail].name = name;
            localStorage.setItem('users', JSON.stringify(users));
            setAllUsers(users);
        }
    }
  };

  const handleSetUserAvatar = (avatar: string) => {
    if (currentUserEmail) {
        const users = { ...allUsers };
        if (users[currentUserEmail]) {
            users[currentUserEmail].avatar = avatar;
            localStorage.setItem('users', JSON.stringify(users));
            setAllUsers(users);
        }
    }
  };

  const handleUpdateChatHistory = (history: AiChatMessage[]) => {
      if (currentUserEmail) {
        const users = { ...allUsers };
        if (users[currentUserEmail]) {
            users[currentUserEmail].chatHistory = history;
            localStorage.setItem('users', JSON.stringify(users));
            setAllUsers(users);
        }
      }
  };

  const handleNavigateToCourse = (weekIndex: number) => {
    setSelectedWeek(weekIndex);
    setCurrentView(View.Course);
  };
  
  const handleNavigateToLiveStudio = () => {
    setCurrentView(View.LiveStudio);
  }

  const handleBackToDashboard = () => {
    setCurrentView(View.Dashboard);
  };
  
  const renderContent = () => {
    if (isAdminLoggedIn) {
      const adminCreds = getAdminCredentials();
      const adminUser: User = { name: adminCreds?.name || 'Admin', progress: {} };
      
      if (adminView === AdminView.LiveStudio) {
          return <LiveStudio currentUser={adminUser} currentUserEmail={adminCreds?.email || ''} isAdmin={true} onExit={() => setAdminView(AdminView.Dashboard)} />;
      }

      return (
        <CourseDataProvider>
          <Header onLogout={handleLogout} isAdmin={true} />
          <AdminLayout
            adminView={adminView}
            setAdminView={setAdminView}
            onUpdateAdminProfile={handleUpdateAdminProfile}
            onUpdateAdminPassword={handleUpdateAdminPassword}
            adminCredentials={adminCreds}
          />
        </CourseDataProvider>

        // return (
  <CourseProvider>
    <CourseDataProvider>
      <Header />

      {!isLoggedIn ? (
        <HomePage />
      ) : isAdminLoggedIn ? (
        <AdminLayout
          view={adminView}
          setView={setAdminView}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
        />
      ) : (
        <>
          {currentView === View.Dashboard && <Dashboard />}
          {currentView === View.Course && <CourseView />}
          {currentView === View.LiveStudio && <LiveStudio />}
          <AiTutor />
          <UserChat />
        </>
      )}

      <Footer />
    </CourseDataProvider>
  </CourseProvider>
// );

      );
    }

    if (isLoggedIn && currentUserEmail) {
      const currentUser = allUsers[currentUserEmail];
      
      if (currentView === View.LiveStudio) {
          return <LiveStudio currentUser={currentUser} currentUserEmail={currentUserEmail} isAdmin={false} onExit={handleBackToDashboard} />;
      }

      return (
        <CourseDataProvider>
          <CourseProvider userEmail={currentUserEmail}>
              <Header 
                onLogout={handleLogout} 
                isAdmin={false} 
                userName={currentUser?.name} 
                userAvatar={currentUser?.avatar}
                onNavigateToLiveStudio={handleNavigateToLiveStudio}
              />
              <main className="flex-grow container mx-auto px-4 py-8">
                  {currentView === View.Dashboard && <Dashboard 
                      onNavigateToCourse={handleNavigateToCourse} 
                      userName={currentUser?.name || ''} 
                      onSetUserName={handleSetUserName}
                      userAvatar={currentUser?.avatar || ''}
                      onSetUserAvatar={handleSetUserAvatar}
                  />}
                  {currentView === View.Course && <CourseView weekIndex={selectedWeek} onBack={handleBackToDashboard} userEmail={currentUserEmail}/>}
              </main>
              <Footer />
              <AiTutor 
                  initialChatHistory={currentUser?.chatHistory || []}
                  onUpdateChatHistory={handleUpdateChatHistory}
              />
              <UserChat userEmail={currentUserEmail} userName={currentUser.name} />
          </CourseProvider>
        </CourseDataProvider>
      );
    }
    return <HomePage onLogin={handleLogin} onAdminLogin={handleAdminLogin}/>;
  };


  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
       {renderContent()}
    </div>
  );
};

export default App;
