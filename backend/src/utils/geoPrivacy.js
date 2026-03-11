/**
 * GPS Precision Reduction for Privacy Protection
 * Reduces coordinate precision to prevent exact location tracking
 * 
 * Precision levels:
 * - 0 decimals: ~111 km
 * - 1 decimal: ~11 km
 * - 2 decimals: ~1.1 km
 * - 3 decimals: ~110 m (RECOMMENDED for events)
 * - 4 decimals: ~11 m
 * - 5+ decimals: ~1 m (exact location - privacy risk)
 */

/**
 * Reduce GPS precision to protect user privacy
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} decimals - Number of decimal places (default: 3 = ~100m radius)
 * @returns {object|null} - Reduced coordinates or null
 */
const reduceGPSPrecision = (lat, lng, decimals = 3) => {
  if (!lat || !lng) return null;
  
  // Validate inputs
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  
  return {
    lat: parseFloat(lat.toFixed(decimals)),
    lng: parseFloat(lng.toFixed(decimals))
  };
};

/**
 * Calculate approximate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

module.exports = {
  reduceGPSPrecision,
  calculateDistance
};
