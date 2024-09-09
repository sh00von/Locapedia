// components/SearchBar.js
import { useState } from 'react';

const SearchBar = ({ setLocations, onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    if (query.trim() === '') return;

    // Invoke the onSearch function passed as a prop
    onSearch(query);
  };

  return (
    <div style={{ margin: '10px', position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for places..."
        style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ddd' }}
      />
      <button onClick={handleSearch} style={{ padding: '8px', marginLeft: '10px', borderRadius: '4px', border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' }}>
        Search
      </button>
    </div>
  );
};

export default SearchBar;
