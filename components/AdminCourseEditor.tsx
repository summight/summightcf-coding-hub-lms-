import React, { useState } from 'react';
import { useCourseData } from '../context/CourseDataContext';
import { Course, Week, Module, ModuleType } from '../types';
import Card from './Card';
import Button from './Button';

const AdminCourseEditor: React.FC = () => {
    const { courseData, setCourseData } = useCourseData();
    const [editableCourse, setEditableCourse] = useState<Course>(JSON.parse(JSON.stringify(courseData))); // Deep copy
    const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({});
    const [saveMessage, setSaveMessage] = useState('');

    const handleCourseChange = (field: keyof Course, value: string) => {
        setEditableCourse(prev => ({ ...prev, [field]: value }));
    };
    
    const handleWeekChange = (weekIndex: number, field: keyof Week, value: string) => {
        setEditableCourse(prev => {
            const newWeeks = [...prev.weeks];
            newWeeks[weekIndex] = { ...newWeeks[weekIndex], [field]: value };
            return { ...prev, weeks: newWeeks };
        });
    };
    
    const handleModuleChange = (weekIndex: number, moduleIndex: number, field: keyof Module, value: string) => {
        setEditableCourse(prev => {
            const newWeeks = [...prev.weeks];
            const newModules = [...newWeeks[weekIndex].modules];
            newModules[moduleIndex] = { ...newModules[moduleIndex], [field]: value };
            newWeeks[weekIndex] = { ...newWeeks[weekIndex], modules: newModules };
            return { ...prev, weeks: newWeeks };
        });
    };

    const handleSaveChanges = () => {
        setCourseData(editableCourse);
        setSaveMessage('Course content saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
    };
    
    const toggleWeek = (weekIndex: number) => {
        setOpenWeeks(prev => ({...prev, [weekIndex]: !prev[weekIndex]}));
    }

    const getModuleContentLabel = (type: ModuleType): string => {
        switch(type) {
            case ModuleType.Video: return "YouTube Video ID";
            case ModuleType.Lesson: return "Lesson Text (Markdown supported)";
            case ModuleType.Exercise: return "Exercise Description";
            case ModuleType.Quiz: return "Quiz Description";
            case ModuleType.Assignment: return "Assignment Prompt";
            default: return "Content";
        }
    }

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Course Editor</h1>
                <p className="text-md text-slate-600 dark:text-slate-400">Modify all aspects of the course content. Changes will be visible to all students.</p>
            </div>

            <Card title="Edit Course Content">
                <div className="sticky top-24 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-4 mb-6 flex items-center gap-4">
                    <Button onClick={handleSaveChanges}>Save All Changes</Button>
                    {saveMessage && <p className="text-green-600 font-semibold">{saveMessage}</p>}
                </div>

                <div className="space-y-4">
                    {editableCourse.weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                            <button onClick={() => toggleWeek(weekIndex)} className="w-full p-4 text-left flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700">
                                <h3 className="text-lg font-semibold">{week.title}</h3>
                                <span className={`transform transition-transform ${openWeeks[weekIndex] ? 'rotate-180' : ''}`}>&#9660;</span>
                            </button>
                            {openWeeks[weekIndex] && (
                                <div className="p-4 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium">Week Title</label>
                                        <input type="text" value={week.title} onChange={e => handleWeekChange(weekIndex, 'title', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-900"/>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium">Week Description</label>
                                        <textarea value={week.description} onChange={e => handleWeekChange(weekIndex, 'description', e.target.value)} rows={2} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-900"/>
                                    </div>

                                    <h4 className="font-semibold mt-4 pt-4 border-t dark:border-slate-600">Modules</h4>
                                    {week.modules.map((module, moduleIndex) => (
                                        <div key={moduleIndex} className="p-4 border dark:border-slate-600 rounded-lg space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium">Module Title</label>
                                                <input type="text" value={module.title} onChange={e => handleModuleChange(weekIndex, moduleIndex, 'title', e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-900" />
                                            </div>
                                             <div>
                                                <label className="block text-sm font-medium">Module Description</label>
                                                <textarea value={module.description || ''} onChange={e => handleModuleChange(weekIndex, moduleIndex, 'description', e.target.value)} rows={2} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-900" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium">{getModuleContentLabel(module.type)}</label>
                                                <textarea value={module.content} onChange={e => handleModuleChange(weekIndex, moduleIndex, 'content', e.target.value)} rows={4} className="mt-1 block w-full p-2 border rounded-md bg-white dark:bg-slate-900" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default AdminCourseEditor;