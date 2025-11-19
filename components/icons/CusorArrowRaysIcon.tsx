import React from 'react';

export const CursorArrowRaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 15l6.75-6.75M9 9l-6.75 6.75M15 9l-6.75 6.75M9 15l6.75-6.75"
    />
  </svg>
);