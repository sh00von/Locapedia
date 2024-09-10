import { useMapEvents, useMap } from 'react-leaflet';
import { useCallback, useRef } from 'react';
import throttle from 'lodash/throttle';

const MapEvents = ({ fetchLocations, setCenter }) => {
  const map = useMap();
  
  // Track the previous center to prevent redundant API calls
  const prevCenterRef = useRef(null);

  // Throttled fetchLocations to prevent excessive API calls
  const throttledFetchLocations = useCallback(
    throttle((lat, lon, radius) => {
      fetchLocations(lat, lon, radius);
    }, 2000), // Limit to one call every 2 seconds
    [fetchLocations]
  );

  // Convert the radius to the nearest integer
  const getRadius = () => {
    const bounds = map.getBounds();
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    const distance = northEast.distanceTo(southWest);
    return Math.round(distance); // Round to the nearest integer
  };

  // Registering the map events for moveend and zoomend
  useMapEvents({
    moveend: () => {
      const mapCenter = map.getCenter();
      const currentCenter = [mapCenter.lat, mapCenter.lng];

      // Check if the center has changed significantly
      if (!prevCenterRef.current || 
          prevCenterRef.current[0] !== currentCenter[0] || 
          prevCenterRef.current[1] !== currentCenter[1]) {
        // Update the center and fetch new locations
        const radius = getRadius();
        setCenter(currentCenter); // Update center state
        throttledFetchLocations(mapCenter.lat, mapCenter.lng, radius); // Fetch new locations

        // Update the reference to the new center
        prevCenterRef.current = currentCenter;
      }
    },
    zoomend: () => {
      const zoomLevel = map.getZoom();
      console.log('Zoom level changed to:', zoomLevel);

      // Fetch locations with updated radius based on current zoom level
      const radius = getRadius();
      throttledFetchLocations(map.getCenter().lat, map.getCenter().lng, radius);
    },
  });

  return null;
};

export default MapEvents;
