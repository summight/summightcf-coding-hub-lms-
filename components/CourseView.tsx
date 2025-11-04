import React, { useState, useEffect, useMemo } from 'react';
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

const getModuleLinks = (): ModuleLinks => {
    const links = localStorage.getItem('moduleLinks');
    return links ? JSON.parse(links) : {};
}

const getSubmissions = (): AssignmentSubmission[] => {
    const submissions = localStorage.getItem('assignmentSubmissions');
    return submissions ? JSON.parse(submissions) : [];
}

const getUser = (email: string): User | null => {
    const users = localStorage.getItem('users');
    if (users) {
        return (JSON.parse(users) as Record<string, User>)[email] || null;
    }
    return null;
}

const ModuleContent: React.FC<{ module: Module; weekIndex: number; moduleIndex: number; userEmail: string; }> = ({ module, weekIndex, moduleIndex, userEmail }) => {
    const [submissionText, setSubmissionText] = useState('');
    const [allSubmissions, setAllSubmissions] = useState<AssignmentSubmission[]>(getSubmissions);
    
    const mySubmission = useMemo(() => {
        const submissionId = `${userEmail}-${weekIndex}-${moduleIndex}`;
        return allSubmissions.find(s => s.id === submissionId);
    }, [allSubmissions, userEmail, weekIndex, moduleIndex]);


    const handleSubmission = () => {
        if (!submissionText.trim()) {
            alert("Submission cannot be empty.");
            return;
        }
        const currentUser = getUser(userEmail);
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

        const updatedSubmissions = [...allSubmissions, newSubmission];
        localStorage.setItem('assignmentSubmissions', JSON.stringify(updatedSubmissions));
        setAllSubmissions(updatedSubmissions);
    }
    
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
            )
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
                <Button variant="primary" onClick={handleSubmission} className="mt-4">Submit Assignment</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
             {externalLink && (
                <a href={externalLink} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full">View External Resource</Button>
                </a>
            )}
            {
                {
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
                }[module.type] || null
            }
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
  const { getModuleStatus, updateModuleStatus } = useCourse();
  const { courseData } = useCourseData();

  const week = courseData.weeks[weekIndex];
  const activeModule = week.modules[activeModuleIndex];
  const activeModuleStatus = getModuleStatus(weekIndex, activeModuleIndex);
  
  const isPreviousModuleCompleted = (moduleIndex: number) => {
      if(moduleIndex === 0) return true;
      return getModuleStatus(weekIndex, moduleIndex - 1) === ModuleStatus.Completed;
  }
  
  useEffect(() => {
    if (activeModuleStatus === ModuleStatus.NotStarted && isPreviousModuleCompleted(activeModuleIndex)) {
        updateModuleStatus(weekIndex, activeModuleIndex, ModuleStatus.InProgress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModuleIndex, weekIndex, activeModuleStatus]);

  const handleModuleSelect = (index: number) => {
    if (isPreviousModuleCompleted(index)) {
      setActiveModuleIndex(index);
      setCompletionMessage(''); // Clear message when switching modules
    }
  };
  
  const handleMarkAsComplete = () => {
    updateModuleStatus(weekIndex, activeModuleIndex, ModuleStatus.Completed);
    setCompletionMessage('Great job! Moving to the next lesson.');
    
    const timer = setTimeout(() => {
        setCompletionMessage('');
    }, 3000);

    // Move to next module if it exists
    if (activeModuleIndex < week.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    }

    return () => clearTimeout(timer);
  };

  return (
    <div>
        <Button onClick={onBack} variant="secondary" className="mb-6">&larr; Back to Dashboard</Button>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Module List */}
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

        {/* Module Content */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">{activeModule.title}</h1>
            {activeModule.description && <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">{activeModule.description}</p>}
            
            <ModuleContent module={activeModule} weekIndex={weekIndex} moduleIndex={activeModuleIndex} userEmail={userEmail}/>
            
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