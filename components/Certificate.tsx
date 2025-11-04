import React, { forwardRef } from 'react';
import { COURSE_DATA } from '../constants';

interface CertificateProps {
  userName: string;
}

const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ userName }, ref) => {
  return (
    <div
      ref={ref}
      className="w-[1000px] h-[700px] p-10 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 flex flex-col items-center justify-center border-8 border-blue-800 font-serif"
    >
      <div className="w-full h-full p-6 flex flex-col items-center border-2 border-blue-500 relative">

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-blue-600">SummightCF Coding Hub</h1>
        </div>
        
        <h2 className="text-5xl font-bold my-6 tracking-wider">Certificate of Completion</h2>
        
        <p className="text-xl mt-4">This is to certify that</p>
        
        <p className="text-4xl font-extrabold text-blue-800 my-6 border border-dashed border-slate-400 px-8 py-4 rounded-md">
            {userName}
        </p>

        <p className="text-xl text-center">has successfully completed the</p>
        
        <p className="text-2xl font-semibold text-center mt-2 mb-8">
            {COURSE_DATA.title}
        </p>
        
        {/* Footer */}
        <div className="w-full flex justify-between items-end mt-auto pt-4">
            <div className="text-center">
                <p className="text-lg font-semibold border-b-2 border-slate-500 px-4 pb-1">Summight C.F.</p>
                <p className="text-sm">Lead Instructor</p>
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold border-b-2 border-slate-500 px-4 pb-1">{new Date().toLocaleDateString()}</p>
                <p className="text-sm">Date of Completion</p>
            </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-blue-300"></div>
        <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-blue-300"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-blue-300"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-blue-300"></div>
      </div>
    </div>
  );
});

export default Certificate;