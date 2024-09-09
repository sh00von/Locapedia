// lib/wikipedia.js

export const getWikipediaLocations = async (lat, lon, radius = 100000) => {
  // Convert radius to an integer
  const radiusInt = Math.round(radius);
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch&gsradius=${radiusInt}&gscoord=${lat}|${lon}&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Log the response to debug
    console.log('Wikipedia API Response:', data);

    if (!data || !data.query || !data.query.geosearch) {
      throw new Error('Invalid response structure');
    }

    // Get the list of locations
    const locations = data.query.geosearch;

    // Fetch detailed descriptions for each location
    const locationDetails = await Promise.all(locations.map(async (item) => {
      const description = await getWikipediaPage(item.title);
      return {
        lat: item.lat,
        lon: item.lon,
        title: item.title,
        description: description || 'No description available',
      };
    }));

    return locationDetails;
  } catch (error) {
    console.error('Error fetching Wikipedia locations:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

// Function to fetch the Wikipedia page extract
export async function getWikipediaPage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=extracts&exintro=&explaintext=&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const page = Object.values(data.query.pages)[0];
    return page.extract || 'No description available';
  } catch (error) {
    console.error('Error fetching Wikipedia page:', error);
    return 'No description available'; // Fallback in case of error
  }
}
