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

export interface Module {
  title: string;
  type: ModuleType;
  content: string; // Could be markdown text, video ID, or exercise description
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
    progress: Progress;
    avatar?: string;
    chatHistory?: AiChatMessage[];
}

export interface AdminCredentials {
    name: string;
    email: string;
    pass: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title:string;
  };
}

export interface AiChatMessage {
  type: 'user' | 'bot';
  text: string;
  sources?: GroundingChunk[];
}

export interface AdminChatMessage {
  sender: 'admin' | string; // string is user's email
  text: string;
  timestamp: number;
  read: boolean;
}

export type ModuleLinks = {
  [weekIndex: number]: {
    [moduleIndex: number]: string;
  };
};

export enum SubmissionStatus {
  Submitted = 'Submitted',
  Graded = 'Graded',
}

export interface AssignmentSubmission {
  id: string; // Composite key: `${userEmail}-${weekIndex}-${moduleIndex}`
  userEmail: string;
  userName: string;
  weekIndex: number;
  moduleIndex: number;
  content: string;
  status: SubmissionStatus;
  grade?: string;
  feedback?: string;
  submittedAt: string; // ISO Date string
}

// --- Live Studio Types ---

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
  isLive: boolean;
  presenterEmail: string | null;
  mode: 'camera' | 'screen';
  allowedCoders: string[]; // list of user emails
  participants: Record<string, { name: string; avatar?: string }>; // email -> user info
  contributions: Record<string, CodeContribution>; // email -> contribution
  isRecording: boolean;
  sessionStartTime: number | null;
  raisedHands: string[];
  cursors: Record<string, { position: number, name: string }>;
}
