// context/CourseDataContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { COURSE_DATA as INITIAL_COURSE_DATA } from '../constants';
import { Course, Week, Module, ModuleType } from '../types';

interface CourseDataContextType {
  courseData: Course;
  setCourseData: (course: Course) => Promise<boolean>; // Now async
  isLoading: boolean;
}

const CourseDataContext = createContext<CourseDataContextType | undefined>(undefined);

// --- CONCEPTUAL DB SERVICE FUNCTIONS ---

// NOTE: This is a complex mock. The real function would:
// 1. SELECT * FROM "Course" and "Content".
// 2. Transform the flat DB tables into the nested Course/Week/Module structure.
const fetchCourseDataFromDB = async (): Promise<Course | null> => {
    console.log("DB: Fetching Course and Content data...");
    // MOCK: Simulate fetching and transforming the initial data
    await new Promise(resolve => setTimeout(resolve, 50)); 
    return INITIAL_COURSE_DATA;
};

// NOTE: This is a complex mock. The real function would:
// 1. Check if Course exists. UPDATE "Course" or INSERT.
// 2. Iterate through weeks/modules. UPDATE or INSERT into "Content" table.
const saveCourseDataToDB = async (course: Course): Promise<boolean> => {
    console.log("DB: Saving Course and Content data...");
    await new Promise(resolve => setTimeout(resolve, 50)); 
    return true; // Assume success
};

// --- END OF CONCEPTUAL DB SERVICE FUNCTIONS ---


export const CourseDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courseData, setCourseDataState] = useState<Course>(INITIAL_COURSE_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
        const data = await fetchCourseDataFromDB();
        if (data) {
            setCourseDataState(data);
        }
        setIsLoading(false);
    };
    loadCourse();
  }, []);

  const setCourseData = async (newCourseData: Course): Promise<boolean> => {
    const success = await saveCourseDataToDB(newCourseData);
    if (success) {
        setCourseDataState(newCourseData);
    }
    return success;
  };

  return (
    <CourseDataContext.Provider value={{ courseData, setCourseData, isLoading }}>
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