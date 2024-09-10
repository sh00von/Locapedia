import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

const FitMapBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0 && map.getZoom() <= 10) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
    }
  }, [locations, map]);

  return null;
};

export default FitMapBounds;
