// src/dbService.ts
import { createClient } from '@supabase/supabase-js';
import { AppUser, AiChatMessage, LiveSessionDBState, LiveStudioChatMessage } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- USER AUTH + PROFILE ---
export const getOrCreateUserProfile = async (
  email: string,
  name: string,
  password: string,
  isSignup: boolean
): Promise<AppUser | null> => {
  let userAuthData, error;

  if (isSignup) {
    ({ data: userAuthData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    }));
  } else {
    ({ data: userAuthData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    }));
  }

  if (error || !userAuthData?.user) return null;

  const userId = userAuthData.user.id;

  const { data: profile } = await supabase
    .from('User')
    .upsert({ id: userId, email, username: name, role: 'USER' }, { onConflict: 'id' })
    .select()
    .single();

  if (!profile) return null;
  return await fetchCurrentUserProfile(userId);
};

// --- ADMIN LOGIN (Fixed) ---
export const loginAsAdmin = async (email: string, password: string): Promise<AppUser | null> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Admin login error:', error.message);
    return null;
  }
  if (!data.user) return null;

  const profile = await fetchCurrentUserProfile(data.user.id);
  if (!profile || profile.role !== 'ADMIN') {
    await supabase.auth.signOut();
    return null;
  }
  return profile;
};

export const fetchCurrentUserProfile = async (userId: string): Promise<AppUser | null> => {
  const { data, error } = await supabase
    .from('User')
    .select('id, email, role, username, avatar, "chatHistory", createdAt, updatedAt')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    name: data.username || data.email,
    progress: {},
    avatar: data.avatar || '',
    chatHistory: data.chatHistory || [],
    username: data.username,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export const fetchAllStudentUsersDB = async (): Promise<AppUser[]> => {
  const { data, error } = await supabase
    .from('User')
    .select('id, email, role, username, avatar, "chatHistory", createdAt, updatedAt')
    .eq('role', 'USER');
  if (error) return [];
  return data ? data.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    name: row.username || row.email,
    progress: {},
    avatar: row.avatar || '',
    chatHistory: row.chatHistory || [],
    username: row.username,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })) : [];
};

export const updateChatHistory = async (userId: string, chatHistory: AiChatMessage[]): Promise<boolean> => {
  const { error } = await supabase.from('User').update({ "chatHistory": chatHistory }).eq('id', userId);
  return !error;
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

// --- LIVE SESSION DB ---
export const startLiveSessionDB = async (presenterId: string, presenterName: string) => {
  const { data } = await supabase
    .from('live_sessions')
    .insert({ presenter_id: presenterId, presenter_name: presenterName, is_active: true })
    .select()
    .single();
  return data;
};

export const endLiveSessionDB = async (sessionId: string) => {
  await supabase
    .from('live_sessions')
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq('id', sessionId);
};

export const joinSessionDB = async (sessionId: string, userId: string, userName: string) => {
  await supabase
    .from('session_participants')
    .upsert({ session_id: sessionId, user_id: userId, user_name: userName }, { onConflict: 'session_id,user_id' });
};

export const leaveSessionDB = async (sessionId: string, userId: string) => {
  await supabase.from('session_participants').delete().eq('session_id', sessionId).eq('user_id', userId);
};

export const fetchLiveState = async (): Promise<LiveSessionDBState | null> => {
  const { data } = await supabase
    .from('live_sessions')
    .select('*, session_participants(*)')
    .eq('is_active', true)
    .single();
  return data || null;
};

// --- EXPORTED: getActiveSession ---
export const getActiveSession = async () => {
  const { data } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('is_active', true)
    .single();
  return data || null;
};

export const saveRecordingDB = async (sessionId: string, url: string) => {
  await supabase.from('live_recordings').insert({ session_id: sessionId, recording_url: url });
};

export const fetchChatMessagesDB = async (sessionId: string): Promise<LiveStudioChatMessage[]> => {
  const { data } = await supabase
    .from('live_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });
  return data || [];
};

export const sendChatMessageDB = async (sessionId: string, senderName: string, senderEmail: string, text: string) => {
  const { data } = await supabase
    .from('live_chat_messages')
    .insert({
      session_id: sessionId,
      sender_name: senderName,
      sender_email: senderEmail,
      text,
      timestamp: Date.now(),
    })
    .select()
    .single();
  return data;
};

export const clearChatMessagesDB = async (sessionId: string) => {
  await supabase.from('live_chat_messages').delete().eq('session_id', sessionId);
};