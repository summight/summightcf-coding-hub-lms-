// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} SummightCF. All rights reserved.</p>
        <p className="text-sm">Bridging Technology</p>
      </div>
    </footer>
  );
};

export default Footer;
