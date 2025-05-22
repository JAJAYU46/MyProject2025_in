import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MapSelector = ({ selectedMapId, onSelect }) => {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await axios.get('http://localhost:5000/maps');
        setMaps(response.data);
      } catch (error) {
        console.error('Failed to load maps:', error);
      }
    };
    fetchMaps();
  }, []);

  return (
    <select value={selectedMapId} onChange={(e) => onSelect(Number(e.target.value))}>
      <option value="">Select Map</option>
      {maps.map(map => (
        <option key={map.id} value={map.id}>
          {map.filename}
        </option>
      ))}
    </select>
  );
};

export default MapSelector;
