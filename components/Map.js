import { MapContainer, Marker, TileLayer, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useCallback } from 'react';
import throttle from 'lodash/throttle';
import { getWikipediaLocations, getLocationCoordinates } from '../lib/wikipedia';
import LoadingSpinner from './LoadingSpinner';
import BottomSheet from './BottomSheet';
import MapEvents from './MapEvents';
import FitMapBounds from './FitMapBounds';
import customIcon from './customIcon';
import styles from './Map.module.css';
import { useRouter } from 'next/router';

const MapRefresher = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.setView(center);
    }
  }, [map, center]);

  return null;
};

const Map = ({ locations, setLocations }) => {
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState([23.8041, 90.4152]); // Default center
  const [zoom, setZoom] = useState(13);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isAtUserLocation, setIsAtUserLocation] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Flag for initial load

  const router = useRouter();
  const { location: queryLocation } = router.query;

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
    const defaultLocation = { lat: 23.8041, lon: 90.4152 };
    localStorage.setItem('userLocation', JSON.stringify(defaultLocation));

    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      const { lat, lon } = JSON.parse(savedLocation);
      setCenter([lat, lon]);
    }

    const requestUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);
            setCenter([latitude, longitude]);
            localStorage.setItem('userLocation', JSON.stringify({ lat: latitude, lon: longitude }));
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    const locationTimeout = setTimeout(requestUserLocation, 3000);

    return () => clearTimeout(locationTimeout);
  }, []);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (queryLocation && initialLoad) {
        try {
          const locationData = await getLocationCoordinates(queryLocation);
          if (locationData) {
            console.log('Fetched coordinates:', locationData); // Debugging line
            setCenter([locationData.lat, locationData.lon]); // Center map on the location
            const newLocations = await getWikipediaLocations(locationData.lat, locationData.lon); // Fetch locations to populate data
            setLocations(newLocations); // Set locations for display
            const selected = newLocations.find(loc => loc.title === queryLocation);
            setSelectedLocation(selected || { title: queryLocation, lat: locationData.lat, lon: locationData.lon });
          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
        }
        setInitialLoad(false); // Prevent re-triggering the effect
      }
    };


    fetchCoordinates();
  }, [queryLocation, initialLoad]);

  useEffect(() => {
    if (userLocation && center) {
      const [userLat, userLon] = userLocation;
      const [centerLat, centerLon] = center;
      const isCloseEnough = Math.abs(userLat - centerLat) < 0.001 && Math.abs(userLon - centerLon) < 0.001;
      setIsAtUserLocation(isCloseEnough);
    }
  }, [userLocation, center]);

  const panToUserLocation = () => {
    if (userLocation) {
      setCenter(userLocation);
      setIsAtUserLocation(true);
    }
  };

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

        {userLocation && (
          <Circle
            center={userLocation}
            radius={300}
            pathOptions={{ color: '#1e90ff', fillOpacity: 0.3 }}
          />
        )}

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lon]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                console.log('Marker clicked:', location); // Debugging line
                setSelectedLocation(location);
                router.push(`/?location=${encodeURIComponent(location.title)}`, undefined, { shallow: true });
              },
            }}
          />
        ))}

        <MapRefresher center={center} />

        <MapEvents fetchLocations={fetchLocations} setCenter={setCenter} />
        <FitMapBounds locations={locations} />
        {loading && <LoadingSpinner />}
      </MapContainer>

      {selectedLocation && (
        <BottomSheet location={selectedLocation} onClose={() => {
          setSelectedLocation(null);
          router.push('/', undefined, { shallow: true });
        }} />
      )}

      {userLocation && (
        <div
          className={styles.liveLocationCircle}
          onClick={panToUserLocation}
          style={{ backgroundColor: isAtUserLocation ? '#d23f3a' : '#888888' }}
        >
          <i className="fas fa-location-arrow" style={{ color: '#ffffff' }}></i>
        </div>
      )}
    </div>
  );
};

export default Map;
