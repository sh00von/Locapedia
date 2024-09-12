// Function to fetch Wikipedia locations within a specified radius
export const getWikipediaLocations = async (lat, lon, radius = 100000) => {
  // Ensure radius is within acceptable range
  const minRadius = 10;
  const maxRadius = 10000;
  const radiusInt = Math.max(minRadius, Math.min(radius, maxRadius));
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&gslimit=100&list=geosearch&gsradius=${radiusInt}&gscoord=${lat}|${lon}&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Log the response for debugging purposes
    console.log('Wikipedia API Response:', data);

    if (!data || !data.query || !data.query.geosearch) {
      throw new Error('Invalid response structure');
    }

    // Extract the list of locations
    const locations = data.query.geosearch;

    // Fetch detailed descriptions and images for each location
    const locationDetails = await Promise.all(locations.map(async (item) => {
      const details = await getWikipediaPage(item.title);
      return {
        lat: item.lat,
        lon: item.lon,
        title: item.title,
        description: details.description,
        image: details.image
      };
    }));

    return locationDetails;
  } catch (error) {
    console.error('Error fetching Wikipedia locations:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Function to fetch the Wikipedia page extract and image
export async function getWikipediaPage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&exintro&piprop=original&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const page = Object.values(data.query.pages)[0];

    // Extract relevant information
    const description = page.extract || 'No description available';
    const image = page.original ? page.original.source : null;

    return { description, image };
  } catch (error) {
    console.error('Error fetching Wikipedia page:', error);
    return { description: 'No description available', image: null }; // Provide fallback in case of error
  }
}

// Function to fetch location coordinates by title
export const getLocationCoordinates = async (title) => {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=coordinates&titles=${encodeURIComponent(title)}&format=json&cllimit=1&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const page = Object.values(data.query.pages)[0];
    if (page.coordinates && page.coordinates.length > 0) {
      const { lat, lon } = page.coordinates[0];
      return { lat, lon };
    } else {
      throw new Error('Coordinates not found for this location');
    }
  } catch (error) {
    console.error('Error fetching coordinates from Wikipedia:', error);
    return null;
  }
};
