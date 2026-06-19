import { useEffect, useState } from 'react';
import workerService from '../../../services/workerService';

export const useWorkerLocationTracker = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Function to handle successful location updates
    const handleSuccess = async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        // Call the backend to update location
        await workerService.updateLocation(latitude, longitude);
      } catch (err) {
        console.error('Failed to update worker location in background:', err);
      }
    };

    const handleError = (error) => {
      setError(error.message);
      console.warn('Background Geolocation Error:', error);
    };

    // We use watchPosition to automatically get updates as the worker moves
    // We set timeout/maximumAge to ensure it doesn't run excessively
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Only get new location if the cached one is older than 60 seconds
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { error };
};
