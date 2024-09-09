import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getWikipediaLocations } from '../lib/wikipedia';
import styles from './index.module.css'; // Import CSS module for styling

// Dynamically import the Map component to prevent server-side rendering issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async (lat, lon, radius = 10000) => {
      try {
        const fetchedLocations = await getWikipediaLocations(lat, lon, radius);
        setLocations(fetchedLocations);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch locations');
        setLoading(false);
      }
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchData(latitude, longitude);
          },
          (error) => {
            setError('Failed to get current location');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
        setLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  return (
    <div className={styles.container}>
      {loading && <div className={styles.loading}>Loading map...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {!loading && !error && <div className={styles.mapContainer}><Map locations={locations} setLocations={setLocations} /></div>}
    </div>
  );
}
