import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import styles from './SearchBar.module.css'; // Custom CSS module

const SearchBar = ({ setCenter, fetchLocations }) => {
  const [error, setError] = useState(null);
  const OPENCAGE_API_KEY = '7873f91ccdaa44919ff595db0ac6d32e'; // Replace with your OpenCage API Key

  const fetchSuggestions = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(inputValue)}&key=${OPENCAGE_API_KEY}&limit=5`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results.length === 0) {
        return [];
      }

      return data.results.map((result) => ({
        label: result.formatted,
        value: { lat: result.geometry.lat, lon: result.geometry.lng },
      }));
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
      setError('Failed to fetch suggestions. Please try again later.');
      return [];
    }
  };

  const handleSelect = async (selectedOption) => {
    if (selectedOption) {
      const { lat, lon } = selectedOption.value;
      setCenter([lat, lon]);

      if (fetchLocations) {
        await fetchLocations(lat, lon, 10000); // Adjust radius as needed
      }

      setError(null);
    }
  };

  return (
    <div className={styles.searchBarContainer}>
      <AsyncSelect
        cacheOptions
        loadOptions={fetchSuggestions}
        onChange={handleSelect}
        placeholder="Search for a location..."
        noOptionsMessage={() => "No suggestions found"}
        defaultOptions={false}
        components={{
          SingleValue: ({ data }) => (
            <div className={styles.customSingleValue}>
              <i className="fas fa-map-marker-alt"></i> {data.label}
            </div>
          ),
          Menu: (props) => <components.Menu {...props} className={styles.customMenu} />,
        }}
        styles={{
          container: (base) => ({
            ...base,
            width: '100%',
            maxWidth: '400px', // Adjust width as needed
            borderRadius: '5px',
            boxShadow: '0 2px 15px rgba(0,0,0,0.2)',
            margin: '0', // Remove margin to align with parent container
          }),
          control: (base) => ({
            ...base,
            height: '40px',
            minHeight: '40px',
            borderRadius: '5px',
            borderColor: '#ccc',
            boxShadow: 'none',
            '&:hover': {
              borderColor: '#aaa',
            },
          }),
          menu: (base) => ({
            ...base,
            marginTop: '5px',
            borderRadius: '5px',
            boxShadow: '0 2px 15px rgba(0,0,0,0.2)',
            zIndex: 1000, // Ensure menu appears above other elements
          }),
          menuList: (base) => ({
            ...base,
            padding: 0,
          }),
          option: (base, { isSelected, isFocused }) => ({
            ...base,
            backgroundColor: isSelected ? '#f0f0f0' : isFocused ? '#fafafa' : '#fff',
            color: '#333',
            padding: '10px 15px',
            cursor: 'pointer',
          }),
          placeholder: (base) => ({
            ...base,
            color: '#aaa',
          }),
        }}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default SearchBar;
