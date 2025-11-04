
import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'small' | 'large';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, size = 'small' }) => {
  const heightClass = size === 'large' ? 'h-4' : 'h-2';
  return (
    <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full ${heightClass}`}>
      <div
        className="bg-blue-600 dark:bg-blue-500 rounded-full ${heightClass}"
        style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}
      ></div>
    </div>
  );
};

export default ProgressBar;
