import { MapContainer, Marker, TileLayer, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useCallback } from 'react';
import throttle from 'lodash/throttle';
import { getWikipediaLocations, getLocationCoordinates } from '../lib/wikipedia';
import LoadingSpinner from './LoadingSpinner';
import BottomSheet from './BottomSheet';
import MapEvents from './MapEvents';
import FitMapBounds from './FitMapBounds';
import L from 'leaflet'; // Import Leaflet for custom icons
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
  const [zoom, setZoom] = useState(15);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isAtUserLocation, setIsAtUserLocation] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Flag for initial load
  const [preventAutoCenter, setPreventAutoCenter] = useState(false); // State for preventing auto-centering
  const [activeMarker, setActiveMarker] = useState(null); // State for active marker

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
    // Fetch locations based on the default center if no queryLocation is provided
    const fetchInitialLocations = async () => {
      if (initialLoad) {
        try {
          await fetchLocations(center[0], center[1], 1000); // Fetch locations around the default center
          setInitialLoad(false);
        } catch (error) {
          console.error('Error fetching initial locations:', error);
        }
      }
    };

    fetchInitialLocations();
  }, [fetchLocations, initialLoad]);

  useEffect(() => {
    const initializeMap = async () => {
      if (queryLocation && initialLoad) {
        try {
          setPreventAutoCenter(true); // Prevent auto-centering while fetching location
          const locationData = await getLocationCoordinates(queryLocation);
          if (locationData) {
            setCenter([locationData.lat, locationData.lon]);
            const newLocations = await getWikipediaLocations(locationData.lat, locationData.lon);
            setLocations(newLocations);
            const selected = newLocations.find(loc => loc.title === queryLocation);
            setSelectedLocation(selected || { title: queryLocation, lat: locationData.lat, lon: locationData.lon });
          }
        } catch (error) {
          console.error('Error fetching coordinates:', error);
        }
        setInitialLoad(false); // Prevent re-triggering the effect
        setPreventAutoCenter(false); // Allow auto-centering after fetching location
      }
    };

    initializeMap();
  }, [queryLocation, initialLoad]);

  useEffect(() => {
    if (!preventAutoCenter && userLocation && center) {
      const [userLat, userLon] = userLocation;
      const [centerLat, centerLon] = center;
      const isCloseEnough = Math.abs(userLat - centerLat) < 0.001 && Math.abs(userLon - centerLon) < 0.001;
      setIsAtUserLocation(isCloseEnough);
    }
  }, [userLocation, center, preventAutoCenter]);

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
          setIsAtUserLocation(true);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleBottomSheetClose = () => {
    setSelectedLocation(null);
    router.push('/', undefined, { shallow: true }); // Remove query parameter from URL but keep the center
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setActiveMarker(location); // Set the clicked marker as active
    router.push(`/?location=${encodeURIComponent(location.title)}`, undefined, { shallow: true });
  };

  const panToUserLocation = () => {
    if (userLocation) {
      setCenter(userLocation);
      setIsAtUserLocation(true);
    } else {
      fetchUserLocation();
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
            icon={activeMarker && activeMarker.title === location.title
              ? L.divIcon({
                  className: 'active-marker-icon',
                  html: `<div class="${styles.activeMarker}"></div>`
                })
              : customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(location),
            }}
          />
        ))}

        <MapRefresher center={center} />

        <MapEvents fetchLocations={fetchLocations} setCenter={setCenter} />
        <FitMapBounds locations={locations} />
        {loading && <LoadingSpinner />}
      </MapContainer>

      {selectedLocation && (
        <BottomSheet location={selectedLocation} onClose={handleBottomSheetClose} />
      )}

      <div
        className={`${styles.liveLocationCircle} ${isAtUserLocation ? styles.active : styles.inactive}`}
        onClick={panToUserLocation}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M13 3C13 2.44772 12.5523 2 12 2C11.4477 2 11 2.44772 11 3V4.06189C7.38128 4.51314 4.51314 7.38128 4.06189 11H3C2.44772 11 2 11.4477 2 12C2 12.5523 2.44772 13 3 13H4.06189C4.51314 16.6187 7.38128 19.4869 11 19.9381V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V19.9381C16.6187 19.4869 19.4869 16.6187 19.9381 13H21C21.5523 13 22 12.5523 22 12C22 11.4477 21.5523 11 21 11H19.9381C19.4869 7.38128 16.6187 4.51314 13 4.06189V3ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8Z" />
        </svg>
      </div>
    </div>
  );
};

export default Map;
