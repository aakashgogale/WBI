import React, { forwardRef } from 'react';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "h-8 w-auto", ...props }, ref) => {
  return (
    <img
      ref={ref}
      src="/Homster-logo.png"
      alt="Homestr"
      className={`${className} object-contain`}
      onError={(e) => {
        // Fallback just in case
        e.target.src = '/Homster xpert .png';
      }}
      {...props}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
