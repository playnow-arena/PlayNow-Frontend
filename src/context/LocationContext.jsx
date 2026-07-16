import React, { createContext, useContext, useState, useEffect } from 'react';
import { reverseGeocode } from '../utils/location';

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

  const updateLocationData = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const { city, area } = await reverseGeocode(lat, lng);
      setLocation({ lat, lng, city, area });
    } catch (err) {
      setError('Failed to get address');
      setLocation({ lat, lng, city: 'Unknown', area: '' });
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => updateLocationData(position.coords.latitude, position.coords.longitude),
      (err) => setError(err.message)
    );
  };

  return (
    <LocationContext.Provider value={{ location, error, loading, requestLocation, setLocation: (loc) => setLocation(loc) }}>
      {children}
    </LocationContext.Provider>
  );
};
