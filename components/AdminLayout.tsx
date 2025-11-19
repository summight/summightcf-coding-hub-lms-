// components/AdminLayout.tsx
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
import { AppUser } from '../src/api/live';
import { ensureAdminExists } from '../src/api/live';  // For real queries
import { UserGroupIcon, BookOpenIcon, DocumentTextIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, CameraIcon } from './icons';

interface AdminChatSummary {
  email: string;
  name: string; 
  unreadCount: number;
  latestUnreadTimestamp: number | null;
}

/**
 * Fetches the summary of all user chats from the DB.
 */
const fetchAllAdminChatSummaries = async (): Promise<AdminChatSummary[]> => {
  // Real query: Join ChatMessage with User for unread counts
  const { data, error } = await supabase
    .from('User')
    .select('id, email, username')
    .eq('role', 'USER');

  if (error) {
    console.error('Chat summaries error:', error);
    return [];
  }

  // Simulate unread (expand with actual ChatMessage count where read=false)
  return data?.map(user => ({
    email: user.email,
    name: user.username || user.email,
    unreadCount: Math.floor(Math.random() * 5),
    latestUnreadTimestamp: Date.now() - Math.random() * 10000,
  })) || [];
};

interface AdminLayoutProps {
  adminView: AdminView;
  setAdminView: (view: AdminView) => void;
  onUpdateAdminProfile: (name: string, email: string) => Promise<boolean>; 
  onUpdateAdminPassword: (oldPass: string, newPass: string) => Promise<boolean>; 
  adminCredentials: AdminCredentials | null;
  allStudents: AppUser[]; 
}

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
  allStudents,
}) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const playNotificationSound = useNotificationSound();

  useEffect(() => {
    const checkMessagesFromDB = async () => {
      const summaries = await fetchAllAdminChatSummaries();
      
      let currentTotalUnread = 0;
      let latestMessage: { name: string; timestamp: number } | null = null;
      
      for (const summary of summaries) {
        currentTotalUnread += summary.unreadCount;

        if (summary.unreadCount > 0 && summary.latestUnreadTimestamp) {
          if (!latestMessage || summary.latestUnreadTimestamp > latestMessage.timestamp) {
            latestMessage = {
              name: summary.name || summary.email,
              timestamp: summary.latestUnreadTimestamp
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

    checkMessagesFromDB();
    
    // Polling for updates (replace with Supabase Realtime subscribe later)
    const pollingInterval = setInterval(checkMessagesFromDB, 5000); 
    
    return () => clearInterval(pollingInterval);
  }, [playNotificationSound]);

  const renderContent = () => {
    switch (adminView) {
      case AdminView.Dashboard:
        return <AdminDashboard allStudents={allStudents} />;
      case AdminView.Content:
        return <AdminCourseEditor />;
      case AdminView.Assignments:
        return <AdminAssignments onBack={() => setAdminView(AdminView.Dashboard)} allStudents={allStudents} />;
      case AdminView.Chat:
        return <AdminChat allStudents={allStudents} />;
      case AdminView.LiveStudio:
        return null;  // Handled in App.tsx
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
        return <AdminDashboard allStudents={allStudents} />;
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
              label="Host Live Studio"  // Admin-specific
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