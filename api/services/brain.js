import fs from 'fs/promises';
import path from 'path';
import { listKbFiles, getFilePreview, ensureKbDir } from './kb-parser.js';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const BRAIN_FILE = path.join(DATA_DIR, 'second_brain.json');
const KB_DIR = path.join(process.cwd(), 'public', 'knowledge_base');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});
}

// Initial seed from current Knowledge Base markdown files
async function seedInitialBrainNotes() {
  const initialFiles = [
    {
      file: 'heuristics_list.md',
      title: "Jakob Nielsen's 10 Usability Heuristics",
      tags: ['Nielsen', 'Core Heuristics', 'Usability', 'Checklist'],
      summary: '10 prinsip dasar evaluasi heuristik antarmuka oleh Jakob Nielsen beserta checklist dan contoh.'
    },
    {
      file: 'shneiderman_eight_golden_rules.md',
      title: "Shneiderman's 8 Golden Rules of Interface Design",
      tags: ['Shneiderman', 'Golden Rules', 'Interface', 'Design'],
      summary: 'Delapan aturan emas perancangan antarmuka oleh Ben Shneiderman.'
    },
    {
      file: 'wcag_accessibility_principles.md',
      title: 'WCAG 2.1 Accessibility Principles (POUR)',
      tags: ['Accessibility', 'WCAG', 'A11y', 'Inclusive'],
      summary: 'Prinsip aksesibilitas web: Perceivable, Operable, Understandable, Robust.'
    },
    {
      file: 'Severity Rules.md',
      title: 'Severity Rating Matrix (Skala 0 - 4)',
      tags: ['Severity', 'Matrix', 'QA', 'Standards'],
      summary: 'Standar klasifikasi tingkat keparahan masalah UX: 0 Kosmetik hingga 4 Blocker Catastrophe.'
    },
    {
      file: 'nngroup_5w2h.md',
      title: 'NN/g 5W+2H Heuristic Analysis Framework',
      tags: ['Framework', 'NN/g', '5W2H', 'Deep Analysis'],
      summary: 'Metode analisis mendalam What, Why, Where, When, Who, How, How Much untuk setiap temuan UX.'
    },
    {
      file: 'custom_prompts_documentation.md',
      title: 'Custom Prompts & Evaluation Documentation',
      tags: ['Prompting', 'Rules', 'System', 'Best Practices'],
      summary: 'Dokumentasi pola prompt dan aturan instruksi evaluasi sistem.'
    }
  ];

  const notes = [];
  for (let i = 0; i < initialFiles.length; i++) {
    const item = initialFiles[i];
    let content = '';
    try {
      content = await fs.readFile(path.join(KB_DIR, item.file), 'utf-8');
    } catch {
      content = `# ${item.title}\n\n${item.summary}`;
    }

    notes.push({
      id: `brain-note-${i + 1}`,
      title: item.title,
      tags: item.tags,
      summary: item.summary,
      content,
      active: true,
      source: 'migrated_kb',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  return notes;
}

export async function getBrainNotes() {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(BRAIN_FILE, 'utf-8');
    const notes = JSON.parse(raw);
    if (Array.isArray(notes) && notes.length > 0) {
      return notes;
    }
  } catch {}

  // File doesn't exist or is empty -> Seed from current KB
  const seeded = await seedInitialBrainNotes();
  await saveBrainNotes(seeded);
  return seeded;
}

export async function saveBrainNotes(notes) {
  await ensureDataDir();
  await fs.writeFile(BRAIN_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}

export async function createBrainNote({ title, tags = [], content = '', summary = '' }) {
  const notes = await getBrainNotes();
  const newNote = {
    id: `note-${Date.now()}`,
    title: title.trim(),
    tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean),
    summary: summary || content.slice(0, 160).replace(/[#*`\n]/g, ' ').trim(),
    content: content.trim(),
    active: true,
    source: 'custom_note',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  await saveBrainNotes(notes);
  return newNote;
}

export async function updateBrainNote(id, { title, tags, content, summary, active }) {
  const notes = await getBrainNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) return null;

  if (title !== undefined) notes[idx].title = title.trim();
  if (tags !== undefined) {
    notes[idx].tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean);
  }
  if (content !== undefined) notes[idx].content = content.trim();
  if (summary !== undefined) notes[idx].summary = summary.trim();
  if (active !== undefined) notes[idx].active = Boolean(active);
  notes[idx].updatedAt = new Date().toISOString();

  await saveBrainNotes(notes);
  return notes[idx];
}

export async function toggleBrainNote(id) {
  const notes = await getBrainNotes();
  const note = notes.find(n => n.id === id);
  if (!note) return null;

  note.active = !note.active;
  note.updatedAt = new Date().toISOString();
  await saveBrainNotes(notes);
  return note;
}

export async function deleteBrainNote(id) {
  let notes = await getBrainNotes();
  const initialLength = notes.length;
  notes = notes.filter(n => n.id !== id);
  if (notes.length === initialLength) return false;

  await saveBrainNotes(notes);
  return true;
}

// Full Context aggregator for AI Evaluation
export async function getActiveBrainContext() {
  const notes = await getBrainNotes();
  const activeNotes = notes.filter(n => n.active);

  // Read files from Vault (Knowledge Base files)
  await ensureKbDir();
  const vaultFiles = await listKbFiles();
  const vaultDocs = {};

  for (const f of vaultFiles) {
    try {
      const text = await getFilePreview(f.filename);
      vaultDocs[f.filename] = text;
    } catch (e) {
      console.warn(`[SecondBrain] Could not preview vault file ${f.filename}:`, e.message);
    }
  }

  return {
    activeNotes,
    vaultDocs,
    totalActiveNotes: activeNotes.length,
    totalVaultDocs: Object.keys(vaultDocs).length
  };
}

export async function getBrainStats() {
  const notes = await getBrainNotes();
  const vaultFiles = await listKbFiles();
  const activeNotes = notes.filter(n => n.active).length;

  return {
    totalNotes: notes.length,
    activeNotes,
    totalVaultFiles: vaultFiles.length,
    totalMemoryItems: activeNotes + vaultFiles.length
  };
}
