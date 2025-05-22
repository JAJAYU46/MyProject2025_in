import React, { useState } from 'react';
import axios from 'axios';

const UploadMap = ({ onUpload }) => {
  const [mapFile, setMapFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!mapFile) return;

    const formData = new FormData();
    formData.append('map', mapFile);

    try {
      const response = await axios.post('http://localhost:5000/upload-map', formData);
      onUpload(); // Refresh map list
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" accept="image/*" onChange={(e) => setMapFile(e.target.files[0])} />
      <button type="submit">Upload Map</button>
    </form>
  );
};

export default UploadMap;
