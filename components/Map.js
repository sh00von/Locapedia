import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@maptiler/leaflet-maptilersdk';
import { useEffect, useState, useCallback } from 'react';
import { getWikipediaLocations } from '../lib/wikipedia';
import LoadingSpinner from './LoadingSpinner';
import BottomSheet from './BottomSheet'; 
import MapEvents from './MapEvents'; 
import FitMapBounds from './FitMapBounds'; 
import customIcon from './customIcon'; 
import styles from './Map.module.css';
import throttle from 'lodash/throttle';

const Map = ({ locations, setLocations }) => {
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([22.3934, 91.821]); // Default center
  const [zoom, setZoom] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchLocations = useCallback(
    throttle(async (lat, lon, radius) => {
      setLoading(true);
      try {
        const newLocations = await getWikipediaLocations(lat, lon, radius);
        setLocations(newLocations);
      } catch (err) {
        console.error('Error fetching locations:', err);
      } finally {
        setLoading(false);
      }
    }, 2000),
    [setLocations]
  );

  useEffect(() => {
    // Retrieve the saved location from localStorage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      const { lat, lon } = JSON.parse(savedLocation);
      setCenter([lat, lon]);
    } else {
      // Fallback to default location
      setCenter([22.3934, 91.821]);
    }
  }, []);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100vw' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}@2x.jpg?key=LfWzJhL81KnXilgBtuk3"
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker 
            key={index} 
            position={[location.lat, location.lon]} 
            icon={customIcon}
            eventHandlers={{
              click: () => {
                setSelectedLocation(location); 
              },
            }}
          />
        ))}

        <MapEvents fetchLocations={fetchLocations} setCenter={setCenter} />
        <FitMapBounds locations={locations} />
        {loading && <LoadingSpinner />}
      </MapContainer>

      {selectedLocation && (
        <BottomSheet location={selectedLocation} onClose={() => setSelectedLocation(null)} />
      )}
    </div>
  );
};

export default Map;
