import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.51.050 1.02.082 1.53.082a9.09 9.09 0 015.742-.931m-5.742.931a9.09 9.09 0 00-5.742-.931m5.742.931L12 21m-4.5 0v.931c0 .518.42.932.931.932h3.138c.518 0 .931-.42.931-.932V21m-4.5 0c-.606 0-1.153.24-1.563.638M12 12V4.5m0 7.5a3 3 0 01-3 3H9a3 3 0 01-3-3m0 0a3 3 0 00-3 3v3a3 3 0 003 3m12-9.75h-6.375a3.375 3.375 0 01-3.375-3.375V8.25a3.375 3.375 0 013.375-3.375h6.375a3.375 3.375 0 013.375 3.375v3.375c0 1.862-1.513 3.375-3.375 3.375z" />
    </svg>
);

export default UserGroupIcon;
