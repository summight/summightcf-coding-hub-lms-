// src/api/live.ts — DUMMY VERSION THAT WORKS IMMEDIATELY
// (We'll make this real later with PHP API — for now, just unblock the app)

export const startLiveSessionDB = async (presenterId: string, presenterName: string) => {
  console.log('Mock: Starting live session for', presenterName);
  return { id: 'mock-session-123', is_active: true };
};

export const joinSessionDB = async (sessionId: string, userId: string, userName: string) => {
  console.log('Mock: User joined', userName);
};

export const leaveSessionDB = async (sessionId: string, userId: string) => {
  console.log('Mock: User left', userId);
};

export const saveRecordingDB = async (sessionId: string, url: string) => {
  console.log('Mock: Recording saved', url);
};

export const fetchChatMessagesDB = async (sessionId: string): Promise<any[]> => {
  return [];
};

export const sendChatMessageDB = async (sessionId: string, senderName: string, senderEmail: string, text: string) => {
  console.log('Mock message:', text);
  return { id: Date.now(), text, senderName, timestamp: Date.now() };
};

export const clearChatMessagesDB = async (sessionId: string) => {
  console.log('Mock: Chat cleared');
};

// Temporary mock for fetchLiveState used in Header or elsewhere
export const fetchLiveState = async () => {
  return null; // No live session
};
