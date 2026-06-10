import React, { forwardRef } from 'react';
import brandConfig from '../../config/brandConfig';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "h-8 w-auto", ...props }, ref) => {
  return (
    <img
      ref={ref}
      src={brandConfig.logoPath}
      alt={brandConfig.brandName}
      className={`${className} object-contain`}
      onError={(e) => {
        // Fallback just in case
        e.target.src = '/logo/WBILogo.jpg';
      }}
      {...props}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
