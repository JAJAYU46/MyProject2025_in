const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load existing markers
const MARKERS_FILE = path.join(__dirname, 'data', 'markers.json');

// Ensure uploads directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir('./uploads/images');
ensureDir('./uploads/audio');
ensureDir('./uploads/maps'); 
ensureDir('./data');


// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.fieldname === 'image' ? './uploads/images' : './uploads/audio';
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Load markers
app.get('/markers', (req, res) => {
  const markers = JSON.parse(fs.readFileSync(MARKERS_FILE, 'utf8') || '[]');
  res.json(markers);
});

// Upload files and save marker
app.post('/add-marker', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req, res) => {
    const { x, y, mapId } = req.body;
  const imagePath = req.files.image[0].path.replace(/\\/g, '/');
  const audioPath = req.files.audio[0].path.replace(/\\/g, '/');

  const newMarker = {
    id: Date.now(),
    x: parseInt(x),
    y: parseInt(y),
    mapId: parseInt(mapId),
    image: '/' + imagePath,
    audio: '/' + audioPath,
  };

  const markers = JSON.parse(fs.readFileSync(MARKERS_FILE, 'utf8') || '[]');
  markers.push(newMarker);
  fs.writeFileSync(MARKERS_FILE, JSON.stringify(markers, null, 2));

  res.json({ success: true, marker: newMarker });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// DELETE /delete-marker/:id
app.delete('/delete-marker/:id', (req, res) => {
  const markerId = parseInt(req.params.id, 10);
  const markersFile = path.join(__dirname, 'data', 'markers.json');

  let markers = [];
  try {
    markers = JSON.parse(fs.readFileSync(markersFile, 'utf-8'));
  } catch (err) {
    console.error('Error reading markers.json:', err);
    return res.status(500).json({ error: 'Failed to read markers file' });
  }

  const marker = markers.find(m => m.id === markerId);
  if (!marker) return res.status(404).json({ error: 'Marker not found' });

  // Remove marker
  markers = markers.filter(m => m.id !== markerId);

  try {
    fs.writeFileSync(markersFile, JSON.stringify(markers, null, 2));
  } catch (err) {
    console.error('Error writing markers.json:', err);
    return res.status(500).json({ error: 'Failed to update markers file' });
  }

  // Delete associated files (relative to /uploads/)
  const deleteFile = (fileUrl) => {
    const relativePath = fileUrl.replace(/^\/+/, ''); // remove starting slashes
    const fullPath = path.join(__dirname, 'uploads', relativePath.split('/').slice(1).join('/'));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  };

  if (marker.image) deleteFile(marker.image);
  if (marker.audio) deleteFile(marker.audio);

  res.json({ success: true });
});

// [Map Upload]

// Storage for maps
const mapStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/maps');  // Make sure this directory exists!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadMap = multer({ storage: mapStorage });

const MAP_DATA_FILE = path.join(__dirname, 'data', 'maps.json');

// Upload new map and clear all markers
app.post('/upload-map', uploadMap.single('map'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No map uploaded' });

  // Clear all markers
  fs.writeFileSync(MARKERS_FILE, JSON.stringify([], null, 2));

  // Save new map path
  const mapPath = '/' + req.file.path.replace(/\\/g, '/');
  fs.writeFileSync(MAP_DATA_FILE, JSON.stringify({ mapPath }, null, 2));

  res.json({ success: true, mapPath });
});
app.get('/current-map', (req, res) => {
  if (!fs.existsSync(MAP_DATA_FILE)) {
    return res.json({ mapPath: null });
  }

  const data = JSON.parse(fs.readFileSync(MAP_DATA_FILE, 'utf-8'));
  res.json({ mapPath: data.mapPath || null });
});


// // Upload new map and clear all markers
// app.post('/upload-map', upload.single('map'), (req, res) => {
//   if (!req.file) return res.status(400).json({ error: 'No map uploaded' });

//   // Clear all markers
//   fs.writeFileSync(MARKERS_FILE, JSON.stringify([], null, 2));

//   // Return new map path
//   const mapPath = '/' + req.file.path.replace(/\\/g, '/');
//   res.json({ success: true, mapPath });
// });
// ==============

// // MAP UPLOAD
// // Configure storage for map images
// const mapStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/maps/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const uploadMap = multer({ storage: mapStorage });

// // Route to handle map image upload
// app.post('/upload-map', uploadMap.single('map'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No map image uploaded' });
//   }

//   // Save map metadata
//   const mapsFile = path.join(__dirname, 'data', 'maps.json');
//   let maps = [];
//   if (fs.existsSync(mapsFile)) {
//     maps = JSON.parse(fs.readFileSync(mapsFile, 'utf-8'));
//   }

//   const newMap = {
//     id: Date.now(),
//     filename: req.file.filename,
//     path: `/uploads/maps/${req.file.filename}`,
//   };

//   maps.push(newMap);
//   fs.writeFileSync(mapsFile, JSON.stringify(maps, null, 2));

//   res.json({ success: true, map: newMap });
// });

// // [Retrieve Available Maps]
// app.get('/maps', (req, res) => {
//     const mapsFile = path.join(__dirname, 'data', 'maps.json');
//     let maps = [];
//     if (fs.existsSync(mapsFile)) {
//       maps = JSON.parse(fs.readFileSync(mapsFile, 'utf-8'));
//     }
//     res.json(maps);
//   });
  
//   // [Clear All Markers for a Specific Map]
//   app.delete('/clear-markers/:mapId', (req, res) => {
//     const mapId = parseInt(req.params.mapId, 10);
//     const markersFile = path.join(__dirname, 'data', 'markers.json');
//     let markers = [];
//     if (fs.existsSync(markersFile)) {
//       markers = JSON.parse(fs.readFileSync(markersFile, 'utf-8'));
//     }
  
//     // Filter out markers for the specified map
//     const remainingMarkers = markers.filter(marker => marker.mapId !== mapId);
  
//     // Optionally, delete associated image and audio files
//     const deletedMarkers = markers.filter(marker => marker.mapId === mapId);
//     deletedMarkers.forEach(marker => {
//       const imagePath = path.join(__dirname, 'uploads', marker.image);
//       const audioPath = path.join(__dirname, 'uploads', marker.audio);
//       if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
//       if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
//     });
  
//     fs.writeFileSync(markersFile, JSON.stringify(remainingMarkers, null, 2));
  
//     res.json({ success: true });
//   });
  