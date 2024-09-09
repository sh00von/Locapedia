// components/Map.js
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useCallback, useState } from 'react';
import { getWikipediaLocations } from '../lib/wikipedia';
import throttle from 'lodash/throttle';
import LoadingSpinner from './LoadingSpinner';

// Example SVG for a marker
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#ff5722" />
      <circle cx="12" cy="12" r="5" fill="#fff" />
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map = ({ locations, setLocations }) => {
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([22.3934, 91.821]); // Chittagong, Bangladesh
  const [zoom, setZoom] = useState(17);

  const fetchLocations = useCallback(throttle(async (lat, lon, radius) => {
    setLoading(true);
    try {
      const newLocations = await getWikipediaLocations(lat, lon, radius);
      setLocations(newLocations);
    } catch (err) {
      console.error('Error fetching new Wikipedia locations:', err);
    } finally {
      setLoading(false);
    }
  }, 2000), [setLocations]);

  function MapEvents() {
    const map = useMap(); // Get map instance

    useMapEvents({
      moveend: () => {
        if (map.getZoom() === zoom) {
          const mapCenter = map.getCenter();
          const radius = Math.round(map.getBounds().getNorthEast().distanceTo(map.getBounds().getSouthWest()) / 2);

          setCenter([mapCenter.lat, mapCenter.lng]);
          fetchLocations(mapCenter.lat, mapCenter.lng, radius);
        }
      },
      zoomend: () => {
        if (Math.abs(map.getZoom() - zoom) > 1) {
          const mapCenter = map.getCenter();
          const radius = Math.round(map.getBounds().getNorthEast().distanceTo(map.getBounds().getSouthWest()) / 2);

          setZoom(map.getZoom()); // Update zoom state
          fetchLocations(mapCenter.lat, mapCenter.lng, radius);
        }
      }
    });

    return null;
  }

  function FitMapBounds() {
    const map = useMap(); // Get map instance

    useEffect(() => {
      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lon]));
        if (map.getZoom() < zoom) {
          map.fitBounds(bounds);
        }
      }
    }, [locations, map, zoom]);

    return null;
  }

  useEffect(() => {
    // Request location permission and update center if allowed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(13);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to default center if permission is denied or an error occurs
          setCenter([22.3569, 91.1836]); // Chittagong, Bangladesh
        }
      );
    }
  }, []);

  return (
    <>
      <MapContainer center={center} zoom={zoom} style={{ height: '100vh', width: '100vw' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lon]} icon={customIcon}>
            <Popup>
              <strong>{location.title}</strong>
              <br />
              {location.description}
            </Popup>
          </Marker>
        ))}
        <FitMapBounds />
        <MapEvents />
        {loading && <LoadingSpinner />}
      </MapContainer>
    </>
  );
};

export default Map;
