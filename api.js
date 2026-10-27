import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import configRouter from './api/routes/config.js';
import kbRouter from './api/routes/kb.js';
import heRouter from './api/routes/he.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/config', configRouter);
app.use('/api/kb', kbRouter);
app.use('/api/he', heRouter);

// Serve static reports/knowledge_base if accessed directly
app.use('/data', express.static(path.join(__dirname, 'public', 'data')));

// Serve frontend production build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8888;
const server = app.listen(PORT, () => {
  console.log(`HE SUITE Backend running on http://localhost:${PORT}`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error('[ERROR]', e);
    process.exit(1);
  }
});
