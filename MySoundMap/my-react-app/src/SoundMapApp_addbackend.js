import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './soundMapApp_addbackend.css';


const SoundMap = () => {
  const audioRef = useRef(new Audio());
  const [markers, setMarkers] = useState([]);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [addingMode, setAddingMode] = useState(false);
  const [newMarkerCoords, setNewMarkerCoords] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newAudio, setNewAudio] = useState(null);
  const [mapUrl, setMapUrl] = useState('/myData/map/myMap.jpg'); // default map path
  const [newMapFile, setNewMapFile] = useState(null);

  // When your React app loads, call /current-map
  useEffect(() => {
    const fetchMap = async () => {
      try {
        const res = await axios.get('http://localhost:5000/current-map');
        if (res.data.mapPath) {
          setMapUrl(`http://localhost:5000${res.data.mapPath}`);
        }
      } catch (err) {
        console.error('Failed to fetch map:', err);
      }
    };
  
    fetchMap();
  }, []);
  
  // Load markers from server
  useEffect(() => {
    axios.get('http://localhost:5000/markers').then(res => setMarkers(res.data));
  }, []);

  const handleMarkerClick = (marker) => {
    if (activeMarkerId === marker.id) {
      audioRef.current.pause();
      setActiveMarkerId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = `http://localhost:5000${marker.audio}`;
      audioRef.current.play();
      setActiveMarkerId(marker.id);
    }
  };
  
  const handleDeleteMarker = async (id) => {
    await axios.delete(`http://localhost:5000/delete-marker/${id}`);
    setMarkers(markers.filter((m) => m.id !== id));
    setActiveMarkerId(null);
  };
  
  const handleUploadNewMap = async () => {
    if (!newMapFile) return;
  
    const formData = new FormData();
    formData.append('map', newMapFile);
  
    try {
      const res = await axios.post('http://localhost:5000/upload-map', formData);
      const newMapPath = res.data.mapPath;
  
      // Clear all markers for current map
      // await axios.delete('http://localhost:5000/clear-markers');
  
      // Update map background and reset markers
      setMapUrl(`http://localhost:5000${newMapPath}`);
      setMarkers([]);
      setActiveMarkerId(null);
      setNewMapFile(null);
    } catch (err) {
      console.error('Failed to upload new map:', err);
    }
  };
  
  const handleMapClick = (e) => {
    if (!addingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNewMarkerCoords({ x, y });
  };

  const handleAddMarker = async () => {
    if (!newImage || !newAudio || !newMarkerCoords) return;

    const formData = new FormData();
    formData.append('x', newMarkerCoords.x);
    formData.append('y', newMarkerCoords.y);
    formData.append('image', newImage);
    formData.append('audio', newAudio);

    const res = await axios.post('http://localhost:5000/add-marker', formData);
    setMarkers([...markers, res.data.marker]);
    resetAddForm();
  };

  const resetAddForm = () => {
    setAddingMode(false);
    setNewMarkerCoords(null);
    setNewImage(null);
    setNewAudio(null);
  };

  return (
    
    <div className="sound-map-container">
      <h1 className="main-header">My Sound Map</h1>

      <div className="sound-map-header">
        <button className="toggle-add-btn" onClick={() => setAddingMode(!addingMode)}>
          {addingMode ? 'Cancel Adding' : 'Add Place'}
        </button>
      </div>

      <div className="map-upload-form">
        <label>
          Upload New Map:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewMapFile(e.target.files[0])}
          />
        </label>
        <button onClick={handleUploadNewMap}>Upload & Switch Map</button>
      </div>
      <div
        className="map-area"
        onClick={handleMapClick}
        style={{ backgroundImage: `url('${mapUrl}')`}}
      >

        {markers.map((marker) => (
          <div key={marker.id} style={{ position: 'absolute', top: marker.y, left: marker.x }}>
            <div
              onClick={() => handleMarkerClick(marker)}
              className="marker red"
            />
            {activeMarkerId === marker.id && (
              <div className="marker-popup">
              <img src={`http://localhost:5000${marker.image}`} alt="Place" />
              <button className="delete-btn" onClick={() => handleDeleteMarker(marker.id)}>Delete</button>
            </div>
            
            )}
          </div>
        ))}

        {newMarkerCoords && addingMode && (
          <div style={{ position: 'absolute', top: newMarkerCoords.y, left: newMarkerCoords.x }}>
            <div className="marker blue" />
          </div>
        )}
      </div>

      {/* Upload form */}
      {addingMode && newMarkerCoords && (
        <div className="upload-form">
          <label>
            Upload Image: 
            <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
          </label>
          <label>
            Upload Sound: 
            <input type="file" accept="audio/*" onChange={(e) => setNewAudio(e.target.files[0])} />
          </label>
          <button onClick={handleAddMarker}>Confirm Add</button>
        </div>

      )}
    </div>
  );
};

export default SoundMap;
