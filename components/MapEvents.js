import { useMapEvents, useMap } from 'react-leaflet';
import { useCallback } from 'react';
import throttle from 'lodash/throttle';

const MapEvents = ({ fetchLocations, setCenter }) => {
  const map = useMap();

  // Throttle function to limit how often fetchLocations is called
  const throttledFetchLocations = useCallback(
    throttle((lat, lon, radius) => {
      fetchLocations(lat, lon, radius);
    }, 2000), // Throttle interval (2000ms = 2 seconds)
    [fetchLocations]
  );

  useMapEvents({
    moveend: () => {
      const mapCenter = map.getCenter();
      const radius = map.getBounds().getNorthEast().distanceTo(map.getBounds().getSouthWest()) / 2;
      setCenter([mapCenter.lat, mapCenter.lng]);
      throttledFetchLocations(mapCenter.lat, mapCenter.lng, radius);
    },
    zoomend: () => {
      // Placeholder for zoom-related logic
      // For example, you might want to adjust the fetch radius or other parameters based on zoom level
      console.log('Zoom level changed to:', map.getZoom());
    }
  });

  return null;
};

export default MapEvents;
