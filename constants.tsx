
import React from 'react';

export const CSV_URL = "https://raw.githubusercontent.com/akarimvand/SAPRA2/main/DATA.CSV";
export const ITEMS_CSV_URL = "https://raw.githubusercontent.com/akarimvand/SAPRA2/main/ITEMS.CSV";
export const PUNCH_CSV_URL = "https://raw.githubusercontent.com/akarimvand/SAPRA2/main/PUNCH.CSV";
export const HOLD_POINT_CSV_URL = "https://raw.githubusercontent.com/akarimvand/SAPRA2/main/HOLD_POINT.CSV";

export const ACCENT_COLOR = "sky"; // e.g., sky, cyan, teal

export const CHART_COLORS = {
  done: '#4caf50',    // Green
  pending: '#ffc107', // Amber
  remaining: '#2196f3', // Blue
  punch: '#f44336',    // Red
  hold: '#9c27b0',     // Purple
};

// Icon Components (using simple SVGs for brevity, consider a library like lucide-react for more complex projects)
// Tailwind classes can be passed via className prop to these components

export const IconCollection: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}><path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zm2 0v14h14V5H5zm2 2h4v4H7V7zm6 0h4v4h-4V7zm-6 6h4v4H7v-4zm6 0h4v4h-4v-4z"/></svg>
);
export const IconFolder: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}><path d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-6l-2-2H4zm0 2h4.586L10 7.414V8H4V6zm16 12H4V10h16v8z"/></svg>
);
export const IconPuzzle: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}><path d="M14 2H10V4H14V2ZM10 4V6H5V8H3V12H5V14H8V16H10V18H12V20H16V16H18V12H20V10H18V8H16V4H10ZM8 8H12V12H16V14H14V12H10V10H8V8Z"/></svg>
);
export const IconChevronRight: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
);
export const IconCheckCircle: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 16.17l7.59-7.59L19 10l-9 9z" clipRule="evenodd"/></svg>
);
export const IconClock: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 6h2v2h-2z" clipRule="evenodd" transform="translate(0,0) scale(1) translate(0,0) rotate(0) translate(0,0)" /></svg>
);
export const IconArrowRepeat: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
);
export const IconExclamationTriangle: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V7h2v7z"/></svg>
);
export const IconFileEarmarkText: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-2 14H8v-2h4v2zm0-4H8V10h4v2zm2-4V4.5L17.5 8H14z"/></svg>
);
export const IconFileEarmarkCheck: React.FC<{className?: string}> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm5.09 10.28-4.5 4.5a1 1 0 0 1-1.41 0L10.5 14.1a1 1 0 1 1 1.41-1.41l2.09 2.08 3.78-3.78a1 1 0 1 1 1.41 1.41L19.09 12.28zM13 9V3.5L18.5 9H13z"/></svg>
);
export const IconFileEarmarkMedical: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 14h-2v2H9v-2H7v-2h2v-2h2v2h2v2zm1-7V3.5L18.5 9H14z"/></svg>
);
export const IconFileEarmarkSpreadsheet: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9 16H7v-2h2v2zm0-4H7v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm4 4h-2v-2h2v2zm0-4h-2v-2h2v2zm-2-4V4.5L17.5 8H15z"/></svg>
);
export const IconPieChartFill: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-12 h-12"}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-7h2v7zm-1-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
);
export const IconSearch: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
);
export const IconDiagram3Fill: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-8 h-8"}><path d="M6 3h12v2H6V3zm0 4h12v2H6V7zm0 10h3v-2H6v2zm5 0h3v-2h-3v2zm5 0h3v-2h-3v2zm-9-4h1v-1H8v1zm7 0h1v-1h-1v1zm-7-2h1V9H8v3zm7 0h1V9h-1v3zm-4-4h3V7h-3v2zm-3 2h1V9H8v1zm7 0h1V9h-1v1z"/></svg>
);
export const IconFileEarmarkExcel: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
);
export const IconBoxSeam: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
);
export const IconMenu: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
);
export const IconX: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
);

export const SAPRA_LOGO_URL = "https://picsum.photos/seed/sapralogo/80/80"; // Placeholder for SAPRA_WHITE-100.png

export const FORM_CARD_DESCRIPTIONS = {
    'FORM A': 'Submitted to Client for Mechanical Completion Approval',
    'FORM B': 'Returned by Client with Pre-Commissioning Punches',
    'FORM C': 'Precom Punches Cleared and Resubmitted for Approval',
    'FORM D': 'Final Client Approval and Subsystem Handover',
};
