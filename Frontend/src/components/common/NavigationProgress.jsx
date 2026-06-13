import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';

// Configure NProgress once
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

const NavigationProgress = () => {
  const location = useLocation();

  useEffect(() => {
    // Start progress bar on route change start
    NProgress.start();

    // Complete progress bar shortly after the new location renders
    const timer = setTimeout(() => {
      NProgress.done();
    }, 150);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
};

export default NavigationProgress;
