
// components/ControlPanel.js
import { useMap } from 'react-leaflet';

const ControlPanel = () => {
  const map = useMap();

  const toggleSatelliteView = () => {
    // Example toggle functionality
    const currentUrl = map.getLayers()[0].options.url;
    const newUrl = currentUrl.includes('satellite') 
      ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    map.getLayers()[0].setUrl(newUrl);
  };

  return (
    <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
      <button onClick={toggleSatelliteView} style={{ padding: '10px', borderRadius: '4px', border: 'none', background: '#007bff', color: '#fff', cursor: 'pointer' }}>
        Toggle Satellite View
      </button>
    </div>
  );
};

export default ControlPanel;
