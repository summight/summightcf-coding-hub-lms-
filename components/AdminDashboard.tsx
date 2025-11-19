import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { AppUser } from '../dbService';
import { useCourseData } from '../context/CourseDataContext';
import Card from './Card';
import ProgressBar from './ProgressBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const UserAvatar: React.FC<{ name?: string; avatar?: string }> = ({ name, avatar }) => {
  if (avatar) {
    return <img src={avatar} alt={name || 'User Avatar'} className="w-10 h-10 rounded-full object-cover" />;
  }
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold">
      {initial}
    </div>
  );
};

interface AdminDashboardProps {
  allStudents: AppUser[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allStudents }) => {
  const { courseData } = useCourseData();
  const totalModules = useMemo(() => courseData.weeks.reduce((sum, week) => sum + week.modules.length, 0), [courseData]);

  const studentData = useMemo(() => {
    return allStudents.map(user => ({
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      progress: calculateOverallProgress(user.progress, totalModules),
    }));
  }, [allStudents, totalModules]);

  const calculateOverallProgress = (progress: any, totalModules: number): number => {
    if (!totalModules || !progress) return 0;
    const completedModules = Object.values(progress)
      .flatMap(week => Object.values(week as any))
      .filter(status => status === 'Completed').length;
    return Math.round((completedModules / totalModules) * 100);
  };

  // Data for Bar Chart
  const barChartData = {
    labels: studentData.map(s => s.name),
    datasets: [
      {
        label: 'Course Progress %',
        data: studentData.map(s => s.progress),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Data for Pie Chart
  const progressDistribution = useMemo(() => {
    const distribution = {
      'Not Started (0%)': 0,
      'In Progress (1-50%)': 0,
      'Nearing Completion (51-99%)': 0,
      'Completed (100%)': 0,
    };
    studentData.forEach(s => {
      if (s.progress === 100) distribution['Completed (100%)']++;
      else if (s.progress > 50) distribution['Nearing Completion (51-99%)']++;
      else if (s.progress > 0) distribution['In Progress (1-50%)']++;
      else distribution['Not Started (0%)']++;
    });
    return distribution;
  }, [studentData]);
  
  const pieChartData = {
    labels: Object.keys(progressDistribution),
    datasets: [
      {
        label: '# of Students',
        data: Object.values(progressDistribution),
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',
          'rgba(234, 179, 8, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="flex-grow container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Administrator Dashboard</h1>
        <p className="text-md text-slate-600 dark:text-slate-400">Overview of student performance and engagement.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Total Students">
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{studentData.length}</p>
        </Card>
        <Card title="Average Progress">
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">
            {studentData.length > 0 ? Math.round(studentData.reduce((acc, s) => acc + s.progress, 0) / studentData.length) : 0}%
          </p>
        </Card>
        <Card title="Completed Students">
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">
            {studentData.filter(s => s.progress === 100).length}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card title="Student Progress Overview">
            <div className="h-96">
              <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={barChartData} />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Student Distribution">
            <div className="h-96 flex items-center justify-center">
              <Pie options={{ responsive: true, maintainAspectRatio: false }} data={pieChartData} />
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">All Students</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="p-4 font-semibold text-sm">Name</th>
                <th className="p-4 font-semibold text-sm">Email</th>
                <th className="p-4 font-semibold text-sm">Progress</th>
              </tr>
            </thead>
            <tbody>
              {studentData.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-slate-500">No student data available yet.</td>
                </tr>
              )}
              {studentData.map(student => (
                <tr key={student.email} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={student.name} avatar={student.avatar} />
                      <span>{student.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{student.email}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <ProgressBar progress={student.progress} />
                      <span className="font-semibold text-sm w-12 text-right">{student.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
