import React from 'react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 bottom-5 -translate-x-1/2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-4 py-2.5 rounded-lg shadow-xl text-sm font-medium z-50 transition-all duration-200 max-w-[92vw] text-center"
    >
      {message}
    </div>
  );
};
