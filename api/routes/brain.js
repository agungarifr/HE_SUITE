import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import {
  getBrainNotes,
  createBrainNote,
  updateBrainNote,
  toggleBrainNote,
  deleteBrainNote,
  getBrainStats
} from '../services/brain.js';
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
  limits: { fileSize: 50 * 1024 * 1024 }
});

// --- Second Brain Stats ---
router.get('/stats', async (req, res) => {
  try {
    const stats = await getBrainStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Brain Notes (Insights / Rules) ---
router.get('/notes', async (req, res) => {
  try {
    const notes = await getBrainNotes();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const { title, tags, content, summary } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi catatan tidak boleh kosong.' });
    }
    const note = await createBrainNote({ title, tags, content, summary });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/notes/:id', async (req, res) => {
  try {
    const updated = await updateBrainNote(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/notes/:id/toggle', async (req, res) => {
  try {
    const toggled = await toggleBrainNote(req.params.id);
    if (!toggled) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan.' });
    }
    res.json(toggled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  try {
    const deleted = await deleteBrainNote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Catatan tidak ditemukan.' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Document Vault (Files) ---
router.get('/vault', async (req, res) => {
  try {
    const files = await listKbFiles();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vault/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }
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

router.get('/vault/preview/:filename', async (req, res) => {
  try {
    const content = await getFilePreview(req.params.filename);
    res.send(content);
  } catch (err) {
    res.status(404).json({ error: 'Gagal memuat pratinjau file: ' + err.message });
  }
});

router.delete('/vault/:filename', async (req, res) => {
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
