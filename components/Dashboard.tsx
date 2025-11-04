import React, { useState, useRef, ChangeEvent } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useCourse } from '../context/CourseContext';
import { useCourseData } from '../context/CourseDataContext';
import { ModuleStatus } from '../types';
import ProgressBar from './ProgressBar';
import Card from './Card';
import { CheckCircleIcon, PlayCircleIcon, SpinnerIcon, TrendingUpIcon, CalendarIcon, CheckBadgeIcon, AcademicCapIcon } from './icons';
import Certificate from './Certificate';
import Button from './Button';

interface DashboardProps {
  onNavigateToCourse: (weekIndex: number) => void;
  userName: string;
  onSetUserName: (name: string) => void;
  userAvatar: string;
  onSetUserAvatar: (avatar: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToCourse, userName, onSetUserName, userAvatar, onSetUserAvatar }) => {
  const { overallProgress, completedModules, totalModules, getModuleStatus } = useCourse();
  const { courseData } = useCourseData();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // State for certificate modal
  const [certificateNameInput, setCertificateNameInput] = useState(userName || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // State for profile edit modal
  const [editedName, setEditedName] = useState(userName || '');
  const [editedAvatar, setEditedAvatar] = useState(userAvatar || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isCourseComplete = overallProgress === 100;

  const handleAvatarFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditedAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    onSetUserName(editedName.trim());
    onSetUserAvatar(editedAvatar);
    setIsProfileModalOpen(false);
  };
  
  const handleOpenProfileModal = () => {
      setEditedName(userName || '');
      setEditedAvatar(userAvatar || '');
      setIsProfileModalOpen(true);
  }

  const handleDownloadCertificate = async () => {
    if (!certificateNameInput.trim()) {
      alert("Please enter your name for the certificate.");
      return;
    }
    if (!certificateRef.current) return;

    // Save the name so it persists
    onSetUserName(certificateNameInput.trim());
    setIsGenerating(true);

    try {
      // Use a brief timeout to allow React to re-render the certificate with the final name if it was just set.
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`SummightCF_Certificate_${certificateNameInput.trim().replace(/ /g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sorry, there was an error generating your certificate. Please try again.");
    } finally {
      setIsGenerating(false);
      setIsCertificateModalOpen(false); // Close the modal after download
    }
  };
  
  const handleOpenCertificateModal = () => {
    setCertificateNameInput(userName || ''); // Pre-fill with saved name
    setIsCertificateModalOpen(true);
  };

  const getCurrentWeek = () => {
    for (let i = 0; i < courseData.weeks.length; i++) {
        const weekCompleted = courseData.weeks[i].modules.every((_, j) => getModuleStatus(i, j) === ModuleStatus.Completed);
        if (!weekCompleted) {
            return i + 1;
        }
    }
    return courseData.weeks.length;
  };

  const renderCertificateCardContent = () => {
    if (!isCourseComplete) {
      return (
        <>
          <p className="text-4xl font-bold text-slate-400 dark:text-slate-500">Locked</p>
          <p className="text-sm text-slate-500">Complete the course to earn!</p>
        </>
      );
    }

    return (
       <Button onClick={handleOpenCertificateModal} className="w-full">
         {userName ? 'View / Download Certificate' : 'Claim Your Certificate'}
       </Button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Hello, {userName}!</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">Welcome back! Let's continue your learning journey.</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
            <Button onClick={handleOpenProfileModal}>Edit Profile</Button>
            <div className="relative">
                {userAvatar ? (
                    <img src={userAvatar} alt="Your avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-md"/>
                ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-4xl border-4 border-white dark:border-slate-700 shadow-md">
                        {userName ? userName.charAt(0).toUpperCase() : '?'}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Overall Progress" icon={<TrendingUpIcon className="w-6 h-6 text-blue-500" />}>
            <div className="flex items-center space-x-4">
                <ProgressBar progress={overallProgress} size="large" />
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
            </div>
        </Card>
        <Card title="Current Week" icon={<CalendarIcon className="w-6 h-6 text-green-500" />}>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">Week {getCurrentWeek()}</p>
        </Card>
        <Card title="Modules Completed" icon={<CheckBadgeIcon className="w-6 h-6 text-yellow-500" />}>
            <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{completedModules} <span className="text-xl text-slate-500">/ {totalModules}</span></p>
        </Card>
        <Card title="Certificates" icon={<AcademicCapIcon className="w-6 h-6 text-red-500" />}>
            {renderCertificateCardContent()}
        </Card>
      </div>

      {/* Course Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <div className="space-y-4">
          {courseData.weeks.map((week, weekIndex) => {
             const completedInWeek = week.modules.filter((_, moduleIndex) => getModuleStatus(weekIndex, moduleIndex) === ModuleStatus.Completed).length;
             const totalInWeek = week.modules.length;
             const weekProgress = totalInWeek > 0 ? (completedInWeek / totalInWeek) * 100 : 0;
             const isComplete = weekProgress === 100;

            return(
            <div key={weekIndex} onClick={() => onNavigateToCourse(weekIndex)} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                <div className="flex-grow pr-4">
                  <div className="flex items-center space-x-2">
                    {isComplete ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <PlayCircleIcon className="w-6 h-6 text-blue-500" />}
                    <h3 className="text-lg font-semibold">{week.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{week.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{completedInWeek} / {totalInWeek} modules completed</p>
                </div>
                <div className="w-full sm:w-1/4 mt-4 sm:mt-0">
                    <ProgressBar progress={weekProgress} />
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold">Edit Your Profile</h2>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-3xl font-light text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
            </div>
            <div className="p-6 flex-grow space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-5xl bg-blue-500 border-4 border-slate-200 dark:border-slate-600 shadow-md">
                        {editedAvatar ? (
                            <img src={editedAvatar} alt="Profile preview" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span>{editedName ? editedName.charAt(0).toUpperCase() : '?'}</span>
                        )}
                    </div>
                    <input 
                        type="file" 
                        ref={avatarInputRef} 
                        onChange={handleAvatarFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <Button variant="secondary" onClick={() => avatarInputRef.current?.click()}>Upload New Picture</Button>
                </div>
                <div>
                    <label htmlFor="profile-name-input" className="block text-sm font-medium mb-1">Full Name</label>
                    <input 
                        id="profile-name-input"
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="e.g., Jane Doe"
                        className="block w-full px-3 py-2 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This name will appear on your certificate.</p>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-4 flex-shrink-0">
                <Button variant="secondary" onClick={() => setIsProfileModalOpen(false)}>Cancel</Button>
                <Button onClick={handleProfileSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {isCertificateModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity"
          onClick={() => setIsCertificateModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold">Certificate Preview</h2>
                <button onClick={() => setIsCertificateModalOpen(false)} className="text-3xl font-light text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
            </div>
            <div className="p-6 flex-grow overflow-y-auto space-y-4">
                <div>
                    <label htmlFor="certificate-name-input" className="block text-sm font-medium mb-1">Enter your full name to see it on the certificate:</label>
                    <input 
                        id="certificate-name-input"
                        type="text"
                        value={certificateNameInput}
                        onChange={(e) => setCertificateNameInput(e.target.value)}
                        placeholder="e.g., Jane Doe"
                        className="block w-full px-3 py-2 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                {/* Certificate Preview */}
                <div className="flex justify-center items-center bg-slate-200 dark:bg-slate-900 p-4 rounded-md overflow-auto">
                   <div className="transform scale-[0.8] origin-center flex-shrink-0">
                     <Certificate ref={certificateRef} userName={certificateNameInput || 'Your Name Here'} />
                   </div>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-4 flex-shrink-0">
                <Button variant="secondary" onClick={() => setIsCertificateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleDownloadCertificate} disabled={isGenerating || !certificateNameInput.trim()} className="inline-flex items-center">
                    {isGenerating ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 mr-2" />
                            Generating PDF...
                        </>
                    ) : 'Download PDF'}
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;