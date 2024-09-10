import { MapContainer, Marker, TileLayer, useMap, Circle } from 'react-leaflet';
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

// Helper component to handle re-centering of the map
const MapRefresher = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map && center) {
      map.setView(center); // Update the map's center whenever the 'center' state changes
    }
  }, [map, center]);

  return null;
};

const Map = ({ locations, setLocations }) => {
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([23.8041, 90.4152]); // Default center
  const [zoom, setZoom] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null); // To store user's location
  const [isAtUserLocation, setIsAtUserLocation] = useState(false); // To check if the map is at the user's location

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
    // Save the default location to localStorage on first load
    const defaultLocation = { lat: 23.8041, lon: 90.4152 };
    localStorage.setItem('userLocation', JSON.stringify(defaultLocation));

    // Retrieve the saved location from localStorage and set the center of the map
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      const { lat, lon } = JSON.parse(savedLocation);
      setCenter([lat, lon]);
    }

    // Ask for location access after 3 seconds
    const requestUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Update the center state to the user's location
            setUserLocation([latitude, longitude]);
            setCenter([latitude, longitude]);
            // Overwrite the saved location in localStorage
            localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lon: longitude }));
          },
          (error) => {
            console.error('Error getting user location:', error);
            // If denied or there's an error, don't change anything.
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    // Delay the location request by 3 seconds
    const locationTimeout = setTimeout(requestUserLocation, 3000);

    // Clear timeout if the component is unmounted
    return () => clearTimeout(locationTimeout);
  }, []);

  // Function to pan to the user's location
  const panToUserLocation = () => {
    if (userLocation) {
      setCenter(userLocation);
      setIsAtUserLocation(true);
    }
  };

  // Check if the map is at the user's location
  useEffect(() => {
    if (userLocation && center) {
      const [userLat, userLon] = userLocation;
      const [centerLat, centerLon] = center;
      const isCloseEnough = Math.abs(userLat - centerLat) < 0.001 && Math.abs(userLon - centerLon) < 0.001;
      setIsAtUserLocation(isCloseEnough);
    }
  }, [userLocation, center]);

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center} // Use the 'center' state to set the map's initial center
        zoom={zoom}
        style={{ height: '100vh', width: '100vw' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/openstreetmap/{z}/{x}/{y}@2x.jpg?key=LfWzJhL81KnXilgBtuk3"
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> contributors'
        />

        {/* Show user's location circle */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={300} // Increase radius for more visibility
            pathOptions={{ color: '#1e90ff', fillOpacity: 0.3 }} // Blue color, more visible
          />
        )}

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

        {/* Auto-refresh map when the 'center' changes */}
        <MapRefresher center={center} />

        <MapEvents fetchLocations={fetchLocations} setCenter={setCenter} />
        <FitMapBounds locations={locations} />
        {loading && <LoadingSpinner />}
      </MapContainer>

      {selectedLocation && (
        <BottomSheet location={selectedLocation} onClose={() => setSelectedLocation(null)} />
      )}

      {/* Circle button to pan to user location */}
      {userLocation && (
        <div 
          className={styles.liveLocationCircle} 
          onClick={panToUserLocation}
          style={{ backgroundColor: isAtUserLocation ? '#d23f3a' : '#888888' }} // Updated color scheme
        >
          <i className="fas fa-location-arrow" style={{ color: '#ffffff' }}></i> {/* Icon inside the circle */}
        </div>
      )}
    </div>
  );
};

export default Map;
