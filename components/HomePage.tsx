import React, { useState } from 'react';
import { COURSE_DATA } from '../constants';
import { SpinnerIcon } from './icons';

interface HomePageProps {
  onLogin: (email: string, name: string) => void;
  onAdminLogin: (email: string, pass: string) => void;
}

type AuthView = 'login' | 'signup';
type PortalView = 'student' | 'admin';

const HomePage: React.FC<HomePageProps> = ({ onLogin, onAdminLogin }) => {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [portalView, setPortalView] = useState<PortalView>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      if (portalView === 'admin') {
        onAdminLogin(email, password);
      } else {
        // In a real app, you would handle form submission to a backend.
        // Here, we just call onLogin to simulate successful authentication.
        onLogin(email, authView === 'signup' ? name : 'Student');
      }
      setIsLoading(false);
    }, 500);
  };

  const renderStudentForm = () => (
    <>
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setAuthView('login')}
          className={`w-1/2 py-4 text-center font-semibold transition-colors ${authView === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          Login
        </button>
        <button
          onClick={() => setAuthView('signup')}
          className={`w-1/2 py-4 text-center font-semibold transition-colors ${authView === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
        >
          Sign Up
        </button>
      </div>
      <h3 className="text-2xl font-bold text-center mb-1 text-slate-800 dark:text-slate-200">{authView === 'login' ? 'Welcome Back!' : 'Create Your Account'}</h3>
      <p className="text-center text-slate-500 dark:text-slate-400 mb-6">{authView === 'login' ? 'Login to access your dashboard.' : 'Enroll in our 6-week course today.'}</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {authView === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75">
          {isLoading ? <SpinnerIcon className="w-5 h-5" /> : (authView === 'login' ? 'Login' : 'Sign Up & Enroll')}
        </button>
      </form>
    </>
  );

  const renderAdminForm = () => (
     <>
      <div className="mb-6">
         <h3 className="text-2xl font-bold text-center mb-1 text-slate-800 dark:text-slate-200">Admin Login</h3>
         <p className="text-center text-slate-500 dark:text-slate-400">Access the administrator dashboard.<br/><span className="text-xs">Default: admin@summightcf.com.ng / admin123</span></p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Admin Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-75">
          {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Login as Admin'}
        </button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_100%_200px,#d5efff,transparent)] dark:bg-[radial-gradient(circle_800px_at_100%_200px,#1e3a8a,transparent)]"></div>
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Info */}
        <div className="text-slate-800 dark:text-slate-200 animate-fade-in-up">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">SummightCF Coding Hub</h1>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 !leading-tight">
            Bridging Technology, <span className="text-blue-500">Building Futures.</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
            {COURSE_DATA.description}
          </p>
           <a href="https://summightcf.com.ng" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">Learn more about SummightCF &rarr;</a>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
           <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg mb-6">
                <button
                    onClick={() => setPortalView('student')}
                    className={`w-1/2 py-2 text-center font-semibold transition-all rounded-md ${portalView === 'student' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}
                >
                    Student Portal
                </button>
                <button
                    onClick={() => setPortalView('admin')}
                    className={`w-1/2 py-2 text-center font-semibold transition-all rounded-md ${portalView === 'admin' ? 'bg-white dark:bg-slate-700 shadow text-red-500' : 'text-slate-500'}`}
                >
                    Admin Portal
                </button>
           </div>
          {portalView === 'student' ? renderStudentForm() : renderAdminForm()}
        </div>
      </div>
    </div>
  );
};

export default HomePage;