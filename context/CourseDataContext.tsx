import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { COURSE_DATA as INITIAL_COURSE_DATA } from '../constants';
import { Course } from '../types';

interface CourseDataContextType {
  courseData: Course;
  setCourseData: (course: Course) => void;
}

const CourseDataContext = createContext<CourseDataContextType | undefined>(undefined);

const getStoredCourseData = (): Course | null => {
    const data = localStorage.getItem('courseData');
    return data ? JSON.parse(data) : null;
};

export const CourseDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courseData, setCourseDataState] = useState<Course>(() => {
    return getStoredCourseData() || INITIAL_COURSE_DATA;
  });

  useEffect(() => {
    // This effect ensures that if the storage is empty, we populate it.
    if (!getStoredCourseData()) {
      localStorage.setItem('courseData', JSON.stringify(INITIAL_COURSE_DATA));
    }
  }, []);

  const setCourseData = (newCourseData: Course) => {
    localStorage.setItem('courseData', JSON.stringify(newCourseData));
    setCourseDataState(newCourseData);
  };

  return (
    <CourseDataContext.Provider value={{ courseData, setCourseData }}>
      {children}
    </CourseDataContext.Provider>
  );
};

export const useCourseData = (): CourseDataContextType => {
  const context = useContext(CourseDataContext);
  if (context === undefined) {
    throw new Error('useCourseData must be used within a CourseDataProvider');
  }
  return context;
};