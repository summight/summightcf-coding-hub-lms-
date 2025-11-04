import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, icon, className }) => {
  return (
    // FIX: Add className prop to allow for custom styling of the Card component.
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        {icon}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Card;
