// context/CourseContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useCourseData } from './CourseDataContext';
import { Progress, ModuleStatus } from '../types';
import { supabase } from '../dbService';  // Real Supabase client

interface CourseContextType {
  progress: Progress;
  updateModuleStatus: (weekIndex: number, moduleIndex: number, status: ModuleStatus) => Promise<void>;
  getModuleStatus: (weekIndex: number, moduleIndex: number) => ModuleStatus;
  totalModules: number;
  completedModules: number;
  overallProgress: number;
  isLoading: boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Helper to map week/module indices to Content ID (assumes Content table has order/courseId)
const weekModuleToContentId = (weekIndex: number, moduleIndex: number, courseData: any): number => {
  // Fetch Content IDs based on course structure
  const week = courseData.weeks[weekIndex];
  if (week) {
    return week.modules[moduleIndex].id || (weekIndex * 100 + moduleIndex + 1);  // Fallback; use real ID from courseData
  }
  return 0;
};

const fetchProgressFromDB = async (userId: string): Promise<Progress> => {
  console.log(`DB: Fetching Progress for user ${userId}...`);
  try {
    const { data, error } = await supabase
      .from('Progress')
      .select('contentId, isCompleted')
      .eq('userId', userId);

    if (error) throw error;

    // Map contentId back to week/module indices (requires course structure; stubbed here)
    const progress: Progress = {};
    data?.forEach(({ contentId, isCompleted }) => {
      // Reverse map contentId to week/module (implement based on Content table order)
      const weekIndex = Math.floor((contentId - 1) / 100);  // Example mapping
      const moduleIndex = (contentId - 1) % 100;
      if (!progress[weekIndex]) progress[weekIndex] = {};
      progress[weekIndex][moduleIndex] = isCompleted ? ModuleStatus.Completed : ModuleStatus.InProgress;
    });

    return progress;
  } catch (error) {
    console.error('Fetch progress error:', error);
    return {};  // Fallback empty
  }
};

const saveProgressToDB = async (userId: string, contentId: number, status: ModuleStatus): Promise<boolean> => {
  console.log(`DB: Upserting Progress for user ${userId}, Content ${contentId} with status ${status}...`);
  try {
    const { error } = await supabase
      .from('Progress')
      .upsert({ userId, contentId, isCompleted: status === ModuleStatus.Completed })
      .eq('userId', userId)
      .eq('contentId', contentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Save progress error:', error);
    return false;
  }
};

// Updated to string userId
export const CourseProvider: React.FC<{ children: ReactNode; userId: string }> = ({ children, userId }) => {
  const { courseData } = useCourseData();

  const [progress, setProgress] = useState<Progress>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Load progress from DB on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (userId) {
        const initialProgress = await fetchProgressFromDB(userId);
        setProgress(initialProgress);
      }
      setIsLoading(false);
    };
    loadProgress();
  }, [userId]);

  const totalModules = courseData.weeks.reduce((sum, week) => sum + week.modules.length, 0);

  const completedModules = Object.values(progress)
    .flatMap(week => Object.values(week))
    .filter(status => status === ModuleStatus.Completed)
    .length;

  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Update progress in state + DB
  const updateModuleStatus = useCallback(async (weekIndex: number, moduleIndex: number, status: ModuleStatus) => {
    const contentId = weekModuleToContentId(weekIndex, moduleIndex, courseData);

    // Optimistic update
    setProgress(prev => {
      const newProgress = JSON.parse(JSON.stringify(prev));
      if (!newProgress[weekIndex]) newProgress[weekIndex] = {};
      newProgress[weekIndex][moduleIndex] = status;
      return newProgress;
    });

    // Save to DB
    const success = await saveProgressToDB(userId, contentId, status);
    if (!success) {
      console.error("Failed to save progress to database. Reverting state...");
      // Rollback: Re-fetch or undo optimistic update
      const initialProgress = await fetchProgressFromDB(userId);
      setProgress(initialProgress);
    }
  }, [userId, courseData]);

  const getModuleStatus = useCallback((weekIndex: number, moduleIndex: number): ModuleStatus => {
    return progress[weekIndex]?.[moduleIndex] || ModuleStatus.NotStarted;
  }, [progress]);

  return (
    <CourseContext.Provider value={{ 
      progress, 
      updateModuleStatus, 
      getModuleStatus, 
      totalModules, 
      completedModules, 
      overallProgress, 
      isLoading 
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = (): CourseContextType => {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};