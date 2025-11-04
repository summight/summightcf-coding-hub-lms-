import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useCourseData } from './CourseDataContext';
import { Progress, ModuleStatus, User } from '../types';

interface CourseContextType {
  progress: Progress;
  updateModuleStatus: (weekIndex: number, moduleIndex: number, status: ModuleStatus) => void;
  getModuleStatus: (weekIndex: number, moduleIndex: number) => ModuleStatus;
  totalModules: number;
  completedModules: number;
  overallProgress: number;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const getAllUsers = (): Record<string, User> => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
};

export const CourseProvider: React.FC<{ children: ReactNode; userEmail: string }> = ({ children, userEmail }) => {
  const { courseData } = useCourseData();

  const [progress, setProgress] = useState<Progress>(() => {
    const users = getAllUsers();
    return users[userEmail]?.progress || {};
  });
  
  const totalModules = courseData.weeks.reduce((sum, week) => sum + week.modules.length, 0);

  const completedModules = Object.values(progress)
    .flatMap(week => Object.values(week))
    .filter(status => status === ModuleStatus.Completed)
    .length;

  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  useEffect(() => {
    if(userEmail) {
        const users = getAllUsers();
        if (users[userEmail]) {
            users[userEmail].progress = progress;
        } else {
            users[userEmail] = { name: '', progress: progress };
        }
        localStorage.setItem('users', JSON.stringify(users));
    }
  }, [progress, userEmail]);

  const updateModuleStatus = useCallback((weekIndex: number, moduleIndex: number, status: ModuleStatus) => {
    setProgress(prev => {
      const newProgress = JSON.parse(JSON.stringify(prev)); // Deep copy
      if (!newProgress[weekIndex]) {
        newProgress[weekIndex] = {};
      }
      newProgress[weekIndex][moduleIndex] = status;
      return newProgress;
    });
  }, []);

  const getModuleStatus = useCallback((weekIndex: number, moduleIndex: number): ModuleStatus => {
    return progress[weekIndex]?.[moduleIndex] || ModuleStatus.NotStarted;
  }, [progress]);

  return (
    <CourseContext.Provider value={{ progress, updateModuleStatus, getModuleStatus, totalModules, completedModules, overallProgress }}>
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