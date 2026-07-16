import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('playnow_location');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      localStorage.setItem('playnow_location', JSON.stringify(location));
    }
  }, [location]);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  };

  return (
    <LocationContext.Provider value={{ location, error, loading, requestLocation, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
