import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getWikipediaLocations } from '../lib/wikipedia';
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

  // Function to fetch locations based on lat, lon, and radius
  const fetchData = async (lat, lon, radius = 10000) => {
    try {
      const roundedRadius = Math.round(radius);
      const fetchedLocations = await getWikipediaLocations(lat, lon, roundedRadius);
      setLocations(fetchedLocations);
      setLoading(false);
      localStorage.setItem('userLocation', JSON.stringify({ lat, lon }));
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to fetch locations. Please try again later.');
      setLoading(false);
    }
  };

  // Function to handle fetching the location and data
  const getLocationAndFetchData = () => {
    const savedLocation = localStorage.getItem('userLocation');

    if (savedLocation) {
      const { lat, lon } = JSON.parse(savedLocation);
      fetchData(lat, lon);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Failed to get current location. Using default location.');
          fetchData(defaultCenter[0], defaultCenter[1]);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by this browser. Using default location.');
      fetchData(defaultCenter[0], defaultCenter[1]);
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
   <div className="container mx-auto p-4 sm:p-6 lg:p-8">
  <header className="text-center mb-8">
    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
      Locapedia
    </h1>
    <p className="text-lg text-gray-600 mt-2 sm:text-xl">
      Discover the World Around You, One Location at a Time.
    </p>
  </header>
  <main>
    {loading && (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner />
      </div>
    )}
    {error && (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md mb-6">
        <h2 className="font-semibold">Error:</h2>
        <p>{error}</p>
      </div>
    )}
    {!loading && !error && (
      <div className="relative h-[70vh] rounded-lg shadow-lg overflow-hidden">
        <Map locations={locations} setLocations={setLocations} />
      </div>
    )}
  </main>
</div>

    </>
  );
}
