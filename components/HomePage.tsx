// components/HomePage.tsx
import React, { useState } from 'react';

interface HomePageProps {
  onLogin: (email: string, pass: string, isSignup: boolean, name: string) => void;
  onAdminLogin: (email: string, password: string) => void;  // ← Add this!
}

const HomePage: React.FC<HomePageProps> = ({ onLogin, onAdminLogin }) => {
  // ... your state (unchanged)
  const [email, setEmail] = useState('admin_courses@summightcf.com.ng');
  const [password, setPassword] = useState('admin@123');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This calls the correct function from App.tsx → dbService.loginAsAdmin
      await onAdminLogin(email, password);  // ← FIXED: use onAdminLogin
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">Admin Portal</h1>
        
        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Hint: admin@123</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Debug: Open console (F12)</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;