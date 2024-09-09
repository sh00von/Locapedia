// components/Legend.js
const Legend = () => {
    return (
      <div style={{ position: 'absolute', bottom: '50px', right: '10px', backgroundColor: '#fff', padding: '10px', borderRadius: '4px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
        <h4>Map Legend</h4>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '20px', backgroundColor: '#ff5722', marginRight: '10px' }}></div>
            <span>Important Locations</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default Legend;
  