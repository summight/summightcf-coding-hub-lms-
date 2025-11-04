import React, { useState, useEffect, useMemo } from 'react';
import { AssignmentSubmission, SubmissionStatus } from '../types';
import { useCourseData } from '../context/CourseDataContext';
import Card from './Card';
import Button from './Button';

interface AdminAssignmentsProps {
    onBack: () => void;
}

const AdminAssignments: React.FC<AdminAssignmentsProps> = ({ onBack }) => {
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [filterWeek, setFilterWeek] = useState<string>('all');
    const [filterModule, setFilterModule] = useState<string>('all');
    const { courseData } = useCourseData();
    
    useEffect(() => {
        const storedSubmissions = localStorage.getItem('assignmentSubmissions');
        if (storedSubmissions) {
            setSubmissions(JSON.parse(storedSubmissions));
        }
    }, []);
    
    const filteredSubmissions = useMemo(() => {
        return submissions
            .filter(s => filterWeek === 'all' || s.weekIndex === parseInt(filterWeek))
            .filter(s => filterModule === 'all' || s.moduleIndex === parseInt(filterModule));
    }, [submissions, filterWeek, filterModule]);

    const handleOpenModal = (submission: AssignmentSubmission) => {
        setSelectedSubmission(submission);
        setGrade(submission.grade || '');
        setFeedback(submission.feedback || '');
    };
    
    const handleCloseModal = () => {
        setSelectedSubmission(null);
        setGrade('');
        setFeedback('');
    };
    
    const handleSaveGrade = () => {
        if (!selectedSubmission) return;

        const updatedSubmissions = submissions.map(s => {
            if (s.id === selectedSubmission.id) {
                return { ...s, grade, feedback, status: SubmissionStatus.Graded };
            }
            return s;
        });

        setSubmissions(updatedSubmissions);
        localStorage.setItem('assignmentSubmissions', JSON.stringify(updatedSubmissions));
        handleCloseModal();
    };

    const getModuleTitle = (weekIndex: number, moduleIndex: number) => {
        return courseData.weeks[weekIndex]?.modules[moduleIndex]?.title || 'Unknown Module';
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Assignment Submissions</h1>
                <p className="text-md text-slate-600 dark:text-slate-400">Review and grade student assignment submissions.</p>
            </div>
            
            <Card title="Filter Submissions">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Filter by Week</label>
                        <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md">
                            <option value="all">All Weeks</option>
                            {courseData.weeks.map((week, index) => <option key={index} value={index}>{week.title}</option>)}
                        </select>
                    </div>
                     <div className="flex-1">
                        <label className="block text-sm font-medium">Filter by Module</label>
                        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md">
                            <option value="all">All Modules</option>
                            {courseData.weeks.flatMap((week, weekIndex) => week.modules.map((module, moduleIndex) => (
                                module.type === 'assignment' && <option key={`${weekIndex}-${moduleIndex}`} value={moduleIndex}>{module.title}</option>
                            )))}
                        </select>
                    </div>
                </div>
            </Card>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th className="p-4 font-semibold text-sm">Student</th>
                            <th className="p-4 font-semibold text-sm">Assignment</th>
                            <th className="p-4 font-semibold text-sm">Submitted</th>
                            <th className="p-4 font-semibold text-sm">Status</th>
                            <th className="p-4 font-semibold text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubmissions.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-8 text-slate-500">No submissions found.</td></tr>
                        ) : (
                            filteredSubmissions.map(s => (
                                <tr key={s.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                                    <td className="p-4">{s.userName}</td>
                                    <td className="p-4">{`W${s.weekIndex + 1}: ${getModuleTitle(s.weekIndex, s.moduleIndex)}`}</td>
                                    <td className="p-4 text-sm text-slate-500">{new Date(s.submittedAt).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.status === SubmissionStatus.Graded ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{s.status}</span>
                                    </td>
                                    <td className="p-4">
                                        <Button variant="secondary" onClick={() => handleOpenModal(s)}>
                                            {s.status === SubmissionStatus.Graded ? 'View/Edit Grade' : 'Grade'}
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b dark:border-slate-700">
                            <h2 className="text-xl font-bold">Grade Submission</h2>
                        </div>
                        <div className="p-6 flex-grow overflow-y-auto space-y-4">
                            <div><strong>Student:</strong> {selectedSubmission.userName}</div>
                            <div><strong>Assignment:</strong> {getModuleTitle(selectedSubmission.weekIndex, selectedSubmission.moduleIndex)}</div>
                            <hr className="dark:border-slate-600"/>
                            <div>
                                <h3 className="font-semibold mb-2">Student's Submission:</h3>
                                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">{selectedSubmission.content}</pre>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Grade</label>
                                <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="e.g., 95% or Pass" className="block w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Feedback</label>
                                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={5} className="block w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md" />
                            </div>
                        </div>
                         <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-4">
                            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                            <Button onClick={handleSaveGrade}>Save Grade</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAssignments;