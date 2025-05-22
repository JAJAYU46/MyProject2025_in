import React, { useRef, useState } from 'react';

const initialMarkers = [
  {
    id: 1,
    x: 150,
    y: 100,
    audio: '/myData/audio/hxh_music1.m4a',
    image: '/myData/images/hxh_place1.jpg',
  },
  {
    id: 2,
    x: 400,
    y: 300,
    audio: '/myData/audio/hxh_music2.m4a',
    image: '/myData/images/hxh_place2.jpg',
  },
];

const SoundMap = () => {
  const audioRef = useRef(new Audio());
  const [markers, setMarkers] = useState(initialMarkers);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newMarker, setNewMarker] = useState(null);

  const handleMarkerClick = (e, marker) => {
    e.stopPropagation();
    if (activeMarkerId === marker.id) {
      setActiveMarkerId(null);
      audioRef.current.pause();
    } else {
      audioRef.current.pause();
      audioRef.current.src = marker.audio;
      audioRef.current.play();
      setActiveMarkerId(marker.id);
    }
  };

  const closeImage = () => {
    setActiveMarkerId(null);
    audioRef.current.pause();
  };

  const handleMapClick = (e) => {
    if (!adding) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setNewMarker({ x, y, image: null, audio: null });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setNewMarker((prev) => ({ ...prev, [type]: url }));
  };

  const handleConfirm = () => {
    if (!newMarker || !newMarker.image || !newMarker.audio) return;

    const newId = markers.length + 1;
    setMarkers((prev) => [...prev, { id: newId, ...newMarker }]);
    setNewMarker(null);
    setAdding(false);
  };

  return (
    <div>
      <button onClick={() => setAdding(!adding)}>
        {adding ? 'Cancel Add' : 'Add Place'}
      </button>

      {newMarker && (
        <div style={{ marginTop: '10px' }}>
          <label>
            Upload Image:
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
          </label>
          <br />
          <label>
            Upload Audio:
            <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} />
          </label>
          <br />
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      )}

      <div
        onClick={handleMapClick}
        style={{
          position: 'relative',
          width: '800px',
          height: '600px',
          backgroundImage: `url('/myData/map/myMap.jpg')`,
          backgroundSize: 'cover',
          border: '2px solid #333',
          marginTop: '10px',
        }}
      >
        {markers.map((marker) => (
          <div
            key={marker.id}
            style={{
              position: 'absolute',
              top: marker.y,
              left: marker.x,
            }}
          >
            <div
              onClick={(e) => handleMarkerClick(e, marker)}
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'red',
                borderRadius: '50%',
                border: '2px solid white',
                cursor: 'pointer',
                boxShadow: '0 0 5px black',
              }}
            />
            {activeMarkerId === marker.id && (
              <img
                src={marker.image}
                alt="Place"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '30px',
                  width: '120px',
                  height: 'auto',
                  border: '2px solid white',
                  borderRadius: '6px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.4)',
                  backgroundColor: 'white',
                  zIndex: 5,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoundMap;
