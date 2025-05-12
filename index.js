require('dotenv').config();
const PASSWORD = process.env.PASSWORD;

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));



const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
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


const UPLOAD_KEY = process.env.UPLOAD_KEY;

app.post('/secret-upload', upload.single('file'), (req, res) => {
  const userKey = req.body.key;

  if (userKey !== UPLOAD_KEY) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  const label = req.body.label;
  const filePath = `/${req.file.filename}`;
  files.push({ label, path: filePath });
  res.json({ success: true });
});


app.get('/search', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const filtered = files.filter(f => f.label.toLowerCase().includes(q));
  res.json(filtered);
});

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
