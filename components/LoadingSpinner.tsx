
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg width="48" height="48" viewBox="0 0 48 48" className="mb-3">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" strokeDashoffset="0">
          <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite"/>
        </circle>
        <circle cx="24" cy="24" r="12" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" strokeDasharray="18.8 18.8" strokeDashoffset="0">
          <animateTransform attributeName="transform" type="rotate" from="360 24 24" to="0 24 24" dur="1.2s" repeatCount="indefinite"/>
        </circle>
      </svg>
      <div className="font-semibold text-sky-600 mb-1">Loading data...</div>
      <div className="text-slate-500 text-sm">Please wait a moment.</div>
    </div>
  );
};

export default LoadingSpinner;
