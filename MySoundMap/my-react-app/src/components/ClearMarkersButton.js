import React from 'react';
import axios from 'axios';

const ClearMarkersButton = ({ mapId, onCleared }) => {
  const handleClear = async () => {
    try {
      await axios.delete(`http://localhost:5000/clear-markers/${mapId}`);
      onCleared(); // Refresh marker state
    } catch (err) {
      console.error('Error clearing markers:', err);
    }
  };

  return (
    <button onClick={handleClear} disabled={!mapId}>
      Clear All Markers for This Map
    </button>
  );
};

export default ClearMarkersButton;
