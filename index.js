require('dotenv').config();
const PASSWORD = process.env.PASSWORD;
const UPLOAD_KEY = process.env.UPLOAD_KEY;

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

let files = [];


app.post('/check-password', (req, res) => {
  const { password } = req.body;
  console.log("Password received:", password);

  if (password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});


app.post('/secret-upload', upload.single('file'), (req, res) => {
  console.log("Received key:", req.body.key);
  console.log("Expected key:", process.env.UPLOAD_KEY);

  const userKey = req.body.key;

  if (userKey !== process.env.UPLOAD_KEY) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const label = req.body.label;
  const filePath = `/${req.file.filename}`;
  files.push({ label, path: filePath });

  res.status(200).json({ success: true, message: 'File uploaded successfully', file: req.file });
});



app.get('/search', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const filtered = files.filter(f => f.label.toLowerCase().includes(q));
  res.json(filtered);
});


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

