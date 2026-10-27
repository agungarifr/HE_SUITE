import fs from 'fs/promises';
import path from 'path';
import { parseOffice } from 'officeparser';

const KB_DIR = path.join(process.cwd(), 'public', 'knowledge_base');

export async function ensureKbDir() {
  await fs.mkdir(KB_DIR, { recursive: true }).catch(() => {});
}

// Extract plain text from any file
export async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (['.txt', '.md', '.json', '.csv'].includes(ext)) {
    return await fs.readFile(filePath, 'utf-8');
  }

  if (['.pptx', '.ppt', '.docx', '.pdf', '.xlsx'].includes(ext)) {
    try {
      const text = await parseOffice(filePath);
      return typeof text === 'string' ? text : JSON.stringify(text);
    } catch (err) {
      console.error(`Error parsing office file ${filePath}:`, err);
      return `[Gagal mengekstrak teks dari file ${path.basename(filePath)}: ${err.message}]`;
    }
  }

  // Fallback
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return `[Format file ${ext} tidak dapat dibaca sebagai teks]`;
  }
}

// Get list of all knowledge base files
export async function listKbFiles() {
  await ensureKbDir();
  const entries = await fs.readdir(KB_DIR, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      if (entry.name.endsWith('.parsed.txt')) continue; // internal parsed cache
      const fullPath = path.join(KB_DIR, entry.name);
      const stat = await fs.stat(fullPath);
      files.push({
        filename: entry.name,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        ext: path.extname(entry.name).toLowerCase()
      });
    }
  }

  return files;
}

// Get preview content of a file
export async function getFilePreview(filename) {
  await ensureKbDir();
  const fullPath = path.join(KB_DIR, filename);
  const cachePath = path.join(KB_DIR, `${filename}.parsed.txt`);

  // Check if cache exists
  try {
    const cached = await fs.readFile(cachePath, 'utf-8');
    return cached;
  } catch {}

  const text = await extractTextFromFile(fullPath);
  // Cache parsed text if not simple text
  if (!['.txt', '.md'].includes(path.extname(filename).toLowerCase())) {
    await fs.writeFile(cachePath, text, 'utf-8').catch(() => {});
  }
  return text;
}

// Read all active KB content combined for AI Context (RAG)
export async function getCombinedKnowledgeBase() {
  await ensureKbDir();
  const files = await listKbFiles();
  const combined = {};

  for (const f of files) {
    try {
      const content = await getFilePreview(f.filename);
      combined[f.filename] = content;
    } catch (e) {
      console.warn(`Could not read KB file ${f.filename}:`, e.message);
    }
  }

  return combined;
}
