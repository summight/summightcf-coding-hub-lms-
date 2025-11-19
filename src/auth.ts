// src/auth.ts
import { AppUser } from '../types';

const API_URL = 'https://courses.summightcf.com.ng/api/login.php';

export async function loginAsAdmin(email: string, password: string): Promise<AppUser | null> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'admin-login',
        email,
        password,
      }),
    });
    
    const data = await res.json();
    if (data.success && data.user) {
      const user: AppUser = {
        id: data.user.id.toString(),
        email: data.user.email,
        role: data.user.role,
        name: data.user.username || data.user.email,
        avatar: data.user.avatar || '',
        chatHistory: data.user.chatHistory ? JSON.parse(data.user.chatHistory) : [],
        username: data.user.username,
      };
      return user;
    }
  } catch (err) {
    console.error('Login error:', err);
  }
  return null;
}

export async function ensureAdminExists() {
  // No longer needed — admin already exists in your DB from earlier
}

export async function logoutUser() {
  // Just clears localStorage in App.tsx
}