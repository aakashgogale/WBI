import React from 'react';

export const ErrorAlert = ({ message, action, actionLabel = 'Retry' }) => {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center my-4">
      <div className="text-3xl mb-3">⚠️</div>
      <div className="mb-4">
        <p className="font-bold text-red-800 text-lg mb-1">Something went wrong</p>
        <p className="text-sm text-red-600">{message}</p>
      </div>
      {action && (
        <button 
          onClick={action} 
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
