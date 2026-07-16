export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    
    if (data.address) {
      const city = data.address.city || data.address.town || data.address.village || '';
      const area = data.address.suburb || data.address.neighbourhood || data.address.residential || '';
      return { city, area };
    }
    return { city: 'Unknown Location', area: '' };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return { city: 'Unknown Location', area: '' };
  }
};
