import { debounce } from 'lodash';

// Utility function to handle API requests
const fetchFromAPI = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Fetch location suggestions based on user input
export const fetchLocationSuggestions = debounce(async (query) => {
  if (!query) return []; // Avoid unnecessary API calls if query is empty

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  try {
    const data = await fetchFromAPI(url);
    // Validate data to ensure it's an array
    if (Array.isArray(data)) {
      return data.map(item => item.display_name);
    } else {
      console.error('Unexpected API response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
}, 300); // Adjust the debounce delay as needed (300ms in this example)

// Fetch location coordinates based on location name
export const fetchLocationCoordinates = async (locationName) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`;
  try {
    const data = await fetchFromAPI(url);
    // Validate data to ensure it's an array
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } else {
      console.error('No coordinates found for:', locationName);
      return null;
    }
  } catch (error) {
    console.error('Error fetching location coordinates:', error);
    return null;
  }
};
