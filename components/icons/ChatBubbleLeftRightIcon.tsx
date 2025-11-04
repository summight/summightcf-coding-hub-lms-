import React from 'react';

const ChatBubbleLeftRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.06c-.247.007-.48.057-.698.144a3 3 0 01-2.433 2.433c-.086.048-.174.086-.264.122l-.332.165a.75.75 0 01-.933-.67V17.25a.75.75 0 00-.75-.75h-2.25a2.25 2.25 0 01-2.25-2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.414-.414 1.024-.649 1.65-.649h3.75c.626 0 1.236.235 1.693.648l.75.75c.25.25.455.54.606.861zM3 14.25a2.25 2.25 0 002.25 2.25h2.25a.75.75 0 00.75-.75V12.75a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v3.75a.75.75 0 00.75.75h2.25a2.25 2.25 0 002.25-2.25v-2.818a2.25 2.25 0 00-.659-1.591l-6.499-6.499A2.25 2.25 0 005.25 4.5h-3.75a2.25 2.25 0 00-2.25 2.25v4.286c0 .97.616 1.813 1.5 2.097z" />
    </svg>
);

export default ChatBubbleLeftRightIcon;