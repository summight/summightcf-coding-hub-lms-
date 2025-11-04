import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminProfile from './AdminProfile';
import AdminCourseEditor from './AdminCourseEditor';
import AdminAssignments from './AdminAssignments';
import AdminChat from './AdminChat';
import Notification from './Notification';
import useNotificationSound from '../hooks/useNotificationSound';
import { AdminView } from '../App';
import { AdminCredentials, User, AdminChatMessage } from '../types';
import { UserGroupIcon, BookOpenIcon, DocumentTextIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, CameraIcon } from './icons';

interface AdminLayoutProps {
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  onUpdateAdminProfile: (name: string, email: string) => boolean;
  onUpdateAdminPassword: (newPass: string) => boolean;
  adminCredentials: AdminCredentials | null;
}

type AllChats = Record<string, AdminChatMessage[]>;

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ icon, label, isActive, onClick, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-colors text-left relative ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="font-semibold flex-grow">{label}</span>
      {badge && badge > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({
  adminView,
  setAdminView,
  onUpdateAdminProfile,
  onUpdateAdminPassword,
  adminCredentials,
}) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const playNotificationSound = useNotificationSound();

  useEffect(() => {
    const checkMessages = () => {
        const chats: AllChats = JSON.parse(localStorage.getItem('adminChats') || '{}');
        const users: Record<string, User> = JSON.parse(localStorage.getItem('users') || '{}');
        
        let currentTotalUnread = 0;
        let latestMessage: { name: string; timestamp: number } | null = null;
        
        for (const email in chats) {
            const userChat = chats[email];
            const unreadFromUser = userChat.filter(msg => msg.sender === email && !msg.read);
            currentTotalUnread += unreadFromUser.length;

            if (unreadFromUser.length > 0) {
                const latestUnreadInChat = unreadFromUser.reduce((latest, current) => current.timestamp > latest.timestamp ? current : latest);
                if (!latestMessage || latestUnreadInChat.timestamp > latestMessage.timestamp) {
                    latestMessage = {
                        name: users[email]?.name || 'a student',
                        timestamp: latestUnreadInChat.timestamp
                    };
                }
            }
        }

        setTotalUnread(prevTotalUnread => {
            if (currentTotalUnread > prevTotalUnread && latestMessage) {
                setNotification(`New message from ${latestMessage.name}`);
                playNotificationSound();
            }
            return currentTotalUnread;
        });
    };

    checkMessages();
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'adminChats' || e.key === 'users') {
            checkMessages();
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [playNotificationSound]);

  const renderContent = () => {
    switch (adminView) {
      case AdminView.Dashboard:
        return <AdminDashboard />;
      case AdminView.Content:
        return <AdminCourseEditor />;
      case AdminView.Assignments:
        return <AdminAssignments onBack={() => setAdminView(AdminView.Dashboard)} />;
      case AdminView.Chat:
        return <AdminChat />;
      case AdminView.LiveStudio:
        // This is now handled in App.tsx to provide a full-screen experience
        return null;
      case AdminView.Profile:
        return (
          <AdminProfile
            onBack={() => setAdminView(AdminView.Dashboard)}
            currentName={adminCredentials?.name || ''}
            currentEmail={adminCredentials?.email || ''}
            onUpdateProfile={onUpdateAdminProfile}
            onUpdatePassword={onUpdateAdminPassword}
            currentPassword={adminCredentials?.pass || ''}
          />
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex-grow container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md space-y-2">
             <NavItem 
                icon={<UserGroupIcon />}
                label="Dashboard"
                isActive={adminView === AdminView.Dashboard}
                onClick={() => setAdminView(AdminView.Dashboard)}
            />
            <NavItem 
                icon={<BookOpenIcon />}
                label="Course Editor"
                isActive={adminView === AdminView.Content}
                onClick={() => setAdminView(AdminView.Content)}
            />
            <NavItem 
                icon={<DocumentTextIcon />}
                label="Assignments"
                isActive={adminView === AdminView.Assignments}
                onClick={() => setAdminView(AdminView.Assignments)}
            />
             <NavItem 
                icon={<ChatBubbleLeftRightIcon />}
                label="Chat"
                isActive={adminView === AdminView.Chat}
                onClick={() => setAdminView(AdminView.Chat)}
                badge={totalUnread}
            />
            <NavItem
                icon={<CameraIcon />}
                label="Live Studio"
                isActive={adminView === AdminView.LiveStudio}
                onClick={() => setAdminView(AdminView.LiveStudio)}
            />
            <NavItem 
                icon={<Cog6ToothIcon />}
                label="Profile"
                isActive={adminView === AdminView.Profile}
                onClick={() => setAdminView(AdminView.Profile)}
            />
          </div>
        </aside>
        <main className="flex-grow min-w-0">{renderContent()}</main>
      </div>
       {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default AdminLayout;
