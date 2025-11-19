// src/types.ts
export enum ModuleType {
  Lesson = 'lesson',
  Video = 'video',
  Exercise = 'exercise',
  Quiz = 'quiz',
  Assignment = 'assignment',
}

export enum ModuleStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export enum SubmissionStatus {
  Submitted = 'Submitted',
  Graded = 'Graded',
}

export interface Module {
  title: string;
  type: ModuleType;
  content: string;
  description?: string;
}

export interface Week {
  title: string;
  description: string;
  modules: Module[];
}

export interface Course {
  title: string;
  description: string;
  weeks: Week[];
}

export interface Progress {
  [weekIndex: number]: {
    [moduleIndex: number]: ModuleStatus;
  };
}

export interface User {
  name: string;
  email?: string;
  id: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
  progress: Progress;
  avatar: string;
  chatHistory: AiChatMessage[];
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCredentials {
  name: string;
  email: string;
  pass: string;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type ModuleLinks = {
  [weekIndex: number]: {
    [moduleIndex: number]: string;
  };
};

export interface AssignmentSubmission {
  id: string;
  userEmail: string;
  userName: string;
  weekIndex: number;
  moduleIndex: number;
  content: string;
  status: SubmissionStatus;
  grade?: string;
  feedback?: string;
  submittedAt: string;
}

export interface LiveStudioChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: number;
}

export interface CodeContribution {
  userEmail: string;
  insertions: number;
  deletions: number;
}

export interface LiveStudioState {
  sessionId: string | null;
  isLive: boolean;
  presenterEmail: string | null;
  mode: 'camera' | 'screen';
  allowedCoders: string[];
  participants: Record<string, { name: string; avatar?: string }>;
  contributions: Record<string, CodeContribution>;
  isRecording: boolean;
  sessionStartTime: number | null;
  raisedHands: string[];
  cursors: Record<string, { position: number; name: string }>;
}

export interface LiveSessionDBState {
  id: string;
  presenter_id: string;
  presenter_name: string;
  is_active: boolean;
  session_participants?: Array<{
    user_id: string;
    user_name: string;
  }>;
}