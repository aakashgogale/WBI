import React from 'react';

export const Skeleton = ({ height = '20px', width = '100%', className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ height, width }}
    />
  );
};
