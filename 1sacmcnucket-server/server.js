const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(__dirname, 'db.json');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB per file
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// List all images
app.get('/api/images', (req, res) => {
  const db = readDb();
  res.json(db.sort((a, b) => b.ts - a.ts));
});

// Upload one or more images
app.post('/api/images', upload.array('images', 20), (req, res) => {
  const db = readDb();
  const added = [];
  for (const file of req.files || []) {
    const entry = {
      id: uuidv4(),
      name: file.originalname,
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      ts: Date.now()
    };
    db.push(entry);
    added.push(entry);
  }
  writeDb(db);
  res.json({ added });
});

// Delete an image
app.delete('/api/images/:id', (req, res) => {
  const db = readDb();
  const entry = db.find(i => i.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });

  const filePath = path.join(UPLOAD_DIR, entry.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const updated = db.filter(i => i.id !== req.params.id);
  writeDb(updated);
  res.json({ deleted: true });
});

// Error handler (e.g. file too large, wrong type)
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`1SacMcNucket server running at http://localhost:${PORT}`);
});
