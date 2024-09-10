import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getWikipediaLocations } from '../lib/wikipedia';
import styles from './index.module.css';
import LoadingSpinner from '../components/LoadingSpinner';
import SEO from '../components/SEO';

// Dynamically import the Map component to prevent server-side rendering issues with Leaflet
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default location coordinates (Chittagong, Bangladesh)
  const defaultCenter = [22.3934, 91.821];
  const fetchData = async (lat, lon, radius = 10000) => {
    try {
      // Ensure the radius is an integer by rounding it
      const roundedRadius = Math.round(radius); // Or Math.floor(radius) if you want to round down
  
      const fetchedLocations = await getWikipediaLocations(lat, lon, roundedRadius); // Use rounded radius here
      setLocations(fetchedLocations);
      setLoading(false);
      
      // Save the fetched location to localStorage
      localStorage.setItem('userLocation', JSON.stringify({ lat, lon }));
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to fetch locations');
      setLoading(false);
    }
  };
  

  // Centralized function to handle fetching the location and data
  const getLocationAndFetchData = () => {
    const savedLocation = localStorage.getItem('userLocation');

    if (savedLocation) {
      const { lat, lon } = JSON.parse(savedLocation);
      fetchData(lat, lon);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchData(latitude, longitude); // Fetch data with user's location
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Failed to get current location. Using default location.');
          fetchData(defaultCenter[0], defaultCenter[1]); // Fallback to default location
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by this browser. Using default location.');
      fetchData(defaultCenter[0], defaultCenter[1]); // Fallback to default location
    }
  };

  useEffect(() => {
    getLocationAndFetchData();
  }, []);

  return (
    <>
      <SEO
        title="Locapedia"
        description="Discover the World Around You, One Location at a Time."
        keywords="nearbywiki,locapedia"
        author="Shovon"
        ogImage="/banner.png"
        ogUrl="https://www.mywebsite.com"
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Locapedia</h1>
          <p className={styles.tagline}>Discover the World Around You, One Location at a Time.</p>
        </header>
        <main className={styles.main}>
          {loading && <LoadingSpinner />}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && (
            <div className={styles.mapContainer}>
              <Map locations={locations} setLocations={setLocations} />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
