// components/CourseView.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCourseData } from '../context/CourseDataContext';
import { useCourse } from '../context/CourseContext';
import { Module, ModuleStatus, ModuleType, ModuleLinks, AssignmentSubmission, SubmissionStatus, User } from '../types';
import Button from './Button';
import { CheckCircleIcon, LockClosedIcon, PlayCircleIcon, PencilIcon, QuizIcon, AssignmentIcon } from './icons';

interface CourseViewProps {
  weekIndex: number;
  onBack: () => void;
  userEmail: string; 
}

// --- DB/Content Mock Service Functions ---
const getModuleLinks = (): ModuleLinks => {
  const links = localStorage.getItem('moduleLinks');
  return links ? JSON.parse(links) : {};
};

const mockWeekModuleToContentId = (weekIndex: number, moduleIndex: number): number => {
  return (weekIndex * 100) + moduleIndex + 1;
};

const fetchSubmissionsByUserId = async (userId: number): Promise<AssignmentSubmission[]> => {
  console.log(`DB: Fetching submissions for userId ${userId}...`);
  await new Promise(resolve => setTimeout(resolve, 50));
  return [];
};

const saveSubmissionToDB = async (userId: number, submission: AssignmentSubmission): Promise<boolean> => {
  console.log(`DB: Saving submission for user ${userId}, content: ${submission.content.substring(0, 20)}...`);
  await new Promise(resolve => setTimeout(resolve, 50));
  return true;
};

const fetchUserByEmail = async (email: string): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return { name: 'Fetched User', id: '1' };
};

const useUserIdFromContext = (userEmail: string) => {
  if (userEmail === 'admin@summightcf.com.ng') return 999;
  return 1;
};

// --- COMPONENT ---
const ModuleContent: React.FC<{ module: Module; weekIndex: number; moduleIndex: number; userEmail: string; }> = ({ module, weekIndex, moduleIndex, userEmail }) => {
  const userId = useUserIdFromContext(userEmail);
  const [submissionText, setSubmissionText] = useState('');
  const [allSubmissions, setAllSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    if (userId) {
      const submissions = await fetchSubmissionsByUserId(userId);
      setAllSubmissions(submissions);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const mySubmission = useMemo(() => {
    const submissionId = `${userEmail}-${weekIndex}-${moduleIndex}`;
    return allSubmissions.find(s => s.id === submissionId);
  }, [allSubmissions, userEmail, weekIndex, moduleIndex]);

  const handleSubmission = async () => {
    if (!submissionText.trim()) {
      alert("Submission cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    const currentUser = await fetchUserByEmail(userEmail);

    const newSubmission: AssignmentSubmission = {
      id: `${userEmail}-${weekIndex}-${moduleIndex}`,
      userEmail,
      userName: currentUser?.name || 'Unknown User',
      weekIndex,
      moduleIndex,
      content: submissionText,
      status: SubmissionStatus.Submitted,
      submittedAt: new Date().toISOString(),
    };

    const success = await saveSubmissionToDB(userId, newSubmission);

    if (success) {
      setAllSubmissions(prev => [...prev.filter(s => s.id !== newSubmission.id), newSubmission]);
      setSubmissionText('');
    } else {
      alert('Failed to submit assignment.');
    }

    setIsSubmitting(false);
  };

  const externalLink = getModuleLinks()[weekIndex]?.[moduleIndex];

  const renderAssignmentContent = () => {
    if (mySubmission) {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Your Submission</h4>
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-300">{mySubmission.content}</pre>
          </div>
          <div className={`p-4 rounded-lg ${mySubmission.status === SubmissionStatus.Graded ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
            <p className="font-semibold">Status: <span className="font-normal">{mySubmission.status}</span></p>
            {mySubmission.grade && <p className="font-semibold">Grade: <span className="font-normal">{mySubmission.grade}</span></p>}
            {mySubmission.feedback && (
              <>
                <p className="font-semibold mt-2">Feedback:</p>
                <p className="mt-1">{mySubmission.feedback}</p>
              </>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h4 className="font-semibold text-lg mb-2 flex items-center"><AssignmentIcon className="w-5 h-5 mr-2 text-blue-500" /> Assignment</h4>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{module.content}</p>
        <textarea
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          className="w-full h-48 bg-white dark:bg-slate-700 p-2 rounded-md font-mono text-sm border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your code or solution here..."
        />
        <Button variant="primary" onClick={handleSubmission} className="mt-4" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {externalLink && (
        <a href={externalLink} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="w-full">View External Resource</Button>
        </a>
      )}
      {{
        [ModuleType.Lesson]: <div className="prose dark:prose-invert max-w-none"><p className="text-slate-600 dark:text-slate-300 leading-relaxed">{module.content}</p></div>,
        [ModuleType.Video]: (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${module.content}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ),
        [ModuleType.Exercise]: (
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-lg mb-2 flex items-center"><PencilIcon className="w-5 h-5 mr-2 text-blue-500" /> Hands-on Exercise</h4>
            <div className="prose dark:prose-invert max-w-none"><p className="text-slate-600 dark:text-slate-300">{module.content}</p></div>
          </div>
        ),
        [ModuleType.Quiz]: (
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-lg mb-2 flex items-center"><QuizIcon className="w-5 h-5 mr-2 text-blue-500" /> Knowledge Check</h4>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{module.content}</p>
            <Button variant="primary">Start Quiz</Button>
          </div>
        ),
        [ModuleType.Assignment]: renderAssignmentContent(),
      }[module.type] || null}
    </div>
  );
};

const getModuleIcon = (module: Module, status: ModuleStatus, isLocked: boolean) => {
  if (status === ModuleStatus.Completed) return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
  if (isLocked) return <LockClosedIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />;

  switch (module.type) {
    case ModuleType.Lesson:
    case ModuleType.Video:
      return <PlayCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    case ModuleType.Exercise:
      return <PencilIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    case ModuleType.Quiz:
      return <QuizIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    case ModuleType.Assignment:
      return <AssignmentIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    default:
      return <PlayCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
  }
};

const CourseView: React.FC<CourseViewProps> = ({ weekIndex, onBack, userEmail }) => {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completionMessage, setCompletionMessage] = useState('');
  const { getModuleStatus, updateModuleStatus, isLoading: isProgressLoading } = useCourse();
  const { courseData, isLoading: isCourseDataLoading } = useCourseData();

  const week = courseData.weeks[weekIndex];
  const activeModule = week.modules[activeModuleIndex];
  const activeModuleStatus = getModuleStatus(weekIndex, activeModuleIndex);

  const isPreviousModuleCompleted = (moduleIndex: number) => {
    if (moduleIndex === 0) return true;
    return getModuleStatus(weekIndex, moduleIndex - 1) === ModuleStatus.Completed;
  };

  useEffect(() => {
    if (!isProgressLoading && !isCourseDataLoading && activeModuleStatus === ModuleStatus.NotStarted && isPreviousModuleCompleted(activeModuleIndex)) {
      updateModuleStatus(weekIndex, activeModuleIndex, ModuleStatus.InProgress);
    }
  }, [activeModuleIndex, weekIndex, activeModuleStatus, isProgressLoading, isCourseDataLoading, updateModuleStatus]);

  const handleModuleSelect = (index: number) => {
    if (isPreviousModuleCompleted(index)) {
      setActiveModuleIndex(index);
      setCompletionMessage('');
    }
  };

  const handleMarkAsComplete = async () => {
    await updateModuleStatus(weekIndex, activeModuleIndex, ModuleStatus.Completed);
    setCompletionMessage('Great job! Moving to the next lesson.');

    const timer = setTimeout(() => {
      setCompletionMessage('');
    }, 3000);

    if (activeModuleIndex < week.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    }

    return () => clearTimeout(timer);
  };

  if (isCourseDataLoading || isProgressLoading) {
    return <div>Loading course content and progress...</div>;
  }

  return (
    <div>
      <Button onClick={onBack} variant="secondary" className="mb-6">Back to Dashboard</Button>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4">{week.title}</h2>
          <ul className="space-y-2">
            {week.modules.map((module, index) => {
              const status = getModuleStatus(weekIndex, index);
              const isLocked = !isPreviousModuleCompleted(index);
              const isActive = index === activeModuleIndex;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleModuleSelect(index)}
                    disabled={isLocked}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors ${
                      isActive ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {getModuleIcon(module, status, isLocked)}
                    <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{module.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">{activeModule.title}</h1>
          {activeModule.description && <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">{activeModule.description}</p>}

          <ModuleContent module={activeModule} weekIndex={weekIndex} moduleIndex={activeModuleIndex} userEmail={userEmail} />

          <div className="mt-8 flex items-center gap-4 h-10">
            {activeModuleStatus !== ModuleStatus.Completed && (
              <Button onClick={handleMarkAsComplete}>Mark as Complete</Button>
            )}
            {completionMessage && (
              <p className="text-green-600 dark:text-green-400 font-semibold transition-opacity duration-300">
                {completionMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;