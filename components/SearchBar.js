import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { fetchLocationSuggestions, fetchLocationCoordinates } from '../lib/locationAPI'; // Adjust path as necessary
import 'tailwindcss/tailwind.css'; // Ensure Tailwind CSS is imported

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  // Debounced function to fetch suggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(async (inputValue) => {
      if (inputValue) {
        try {
          setIsLoading(true);
          const results = await fetchLocationSuggestions(inputValue);
          setSuggestions(Array.isArray(results) ? results : []);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 1000), // Delay of 1 second
    []
  );

  // Handle input value changes
  const handleChange = (event) => {
    const { value } = event.target;
    setQuery(value);
    debouncedFetchSuggestions(value); // Use debounced function
  };

  // Handle suggestion selection
  const handleSelect = async (selectedLocation) => {
    setQuery(selectedLocation);
    setSuggestions([]);
    setHighlightedIndex(-1);
    try {
      const coords = await fetchLocationCoordinates(selectedLocation);
      if (coords) {
        onSearch(coords);
        setOverlayVisible(false);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      handleSelect(suggestions[highlightedIndex]);
    }
  };

  // Focus input when overlay is visible
  useEffect(() => {
    if (isOverlayVisible) {
      inputRef.current?.focus();
    }
  }, [isOverlayVisible]);

  // Close overlay when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target.id === 'overlay') {
      setOverlayVisible(false);
    }
  };

  return (
    <>
      {/* Button to show the search bar with SVG icon */}
      <button
        className="fixed bottom-4 left-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        onClick={() => setOverlayVisible(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="white"
          viewBox="0 0 50 50"
        >
          <path d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z" />
        </svg>
      </button>

      {/* Overlay with Search Bar */}
      {isOverlayVisible && (
        <div
          id="overlay"
          className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center"
          onClick={handleOverlayClick}
          style={{ zIndex: 500000 }}
        >
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setOverlayVisible(false)}
            >
              &times;
            </button>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search for a location"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={inputRef}
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
              aria-controls="suggestions-list"
              aria-activedescendant={`suggestion-${highlightedIndex}`}
            />
            {isLoading && <p className="text-gray-500 mt-2">Loading...</p>}
            {Array.isArray(suggestions) && suggestions.length > 0 && (
              <ul
                id="suggestions-list"
                className="mt-2 border border-gray-300 rounded-md max-h-60 overflow-y-auto"
                role="listbox"
              >
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    id={`suggestion-${index}`}
                    onClick={() => handleSelect(suggestion)}
                    className={`cursor-pointer p-2 ${
                      highlightedIndex === index
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-200'
                    }`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
