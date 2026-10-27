import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { listKbFiles, getFilePreview } from '../services/kb-parser.js';

const router = Router();
const KB_DIR = path.join(process.cwd(), 'public', 'knowledge_base');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, KB_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// List files
router.get('/', async (req, res) => {
  try {
    const files = await listKbFiles();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }
    // Pre-parse and warm up cache
    const preview = await getFilePreview(req.file.filename);
    res.json({
      success: true,
      filename: req.file.filename,
      size: req.file.size,
      previewSnippet: preview.slice(0, 300)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview text content
router.get('/preview/:filename', async (req, res) => {
  try {
    const content = await getFilePreview(req.params.filename);
    res.send(content);
  } catch (err) {
    res.status(404).json({ error: 'File tidak ditemukan atau gagal diparsing: ' + err.message });
  }
});

// Create/Edit text rule
router.post('/text', async (req, res) => {
  try {
    let { filename, content } = req.body;
    if (!filename.endsWith('.md') && !filename.endsWith('.txt')) {
      filename += '.md';
    }
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = path.join(KB_DIR, safeName);
    await fs.writeFile(targetPath, content || '', 'utf-8');
    res.json({ success: true, filename: safeName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete file
router.delete('/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const targetPath = path.join(KB_DIR, filename);
    const cachePath = path.join(KB_DIR, `${filename}.parsed.txt`);
    
    await fs.unlink(targetPath).catch(() => {});
    await fs.unlink(cachePath).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
