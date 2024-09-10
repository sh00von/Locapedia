export const getWikipediaLocations = async (lat, lon, radius = 100000) => {
  // Convert radius to an integer
  const radiusInt = Math.round(radius);
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&gslimit=40&list=geosearch&gsradius=${radiusInt}&gscoord=${lat}|${lon}&origin=*`;

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
    throw error; // Re-throw the error to be caught by the caller
  }
};

// Function to fetch the Wikipedia page extract and image
export async function getWikipediaPage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&exintro&piprop=original&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const page = Object.values(data.query.pages)[0];

    // Extract the relevant information
    const description = page.extract || 'No description available';
    const image = page.original ? page.original.source : null;

    return { description, image };
  } catch (error) {
    console.error('Error fetching Wikipedia page:', error);
    return { description: 'No description available', image: null }; // Fallback in case of error
  }
}
