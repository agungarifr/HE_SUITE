import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, Eye, Plus, CheckCircle, XCircle, Search, Tag, BookOpen, Layers } from 'lucide-react';

export default function SecondBrain({ onBrainChanged = () => {} }) {
  const [subTab, setSubTab] = useState('notes'); // 'notes' | 'vault'
  const [stats, setStats] = useState({ totalNotes: 0, activeNotes: 0, totalVaultFiles: 0, totalMemoryItems: 0 });
  const [loading, setLoading] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', tags: '', content: '' });

  // Vault state
  const [vaultFiles, setVaultFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Fetch all stats and data
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/brain/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        onBrainChanged(data.totalMemoryItems || 0);
      }
    } catch (e) {
      console.warn('Error fetching stats:', e);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/brain/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error('Error fetching notes:', e);
    }
  };

  const fetchVault = async () => {
    try {
      const res = await fetch('/api/brain/vault');
      if (res.ok) {
        const data = await res.json();
        setVaultFiles(data);
      }
    } catch (e) {
      console.error('Error fetching vault:', e);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchNotes(), fetchVault()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // --- Brain Notes Actions ---
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      alert('Judul dan isi catatan wajib diisi!');
      return;
    }

    try {
      if (editingNoteId) {
        // Update
        const res = await fetch(`/api/brain/notes/${editingNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteForm)
        });
        if (res.ok) {
          setEditingNoteId(null);
          setNoteForm({ title: '', tags: '', content: '' });
          await refreshAll();
        }
      } else {
        // Create
        const res = await fetch('/api/brain/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteForm)
        });
        if (res.ok) {
          setNoteForm({ title: '', tags: '', content: '' });
          await refreshAll();
        }
      }
    } catch (err) {
      alert('Gagal menyimpan catatan: ' + err.message);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await fetch(`/api/brain/notes/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        await refreshAll();
      }
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  const handleDeleteNote = async (id, title) => {
    if (!window.confirm(`Hapus catatan "${title}" dari Second Brain?`)) return;
    try {
      const res = await fetch(`/api/brain/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingNoteId === id) {
          setEditingNoteId(null);
          setNoteForm({ title: '', tags: '', content: '' });
        }
        await refreshAll();
      }
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      tags: (note.tags || []).join(', '),
      content: note.content
    });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Extract unique tags for filtering
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).filter(Boolean);

  const filteredNotes = notes.filter(n => {
    const matchesQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag === 'ALL' || (n.tags || []).includes(selectedTag);
    return matchesQuery && matchesTag;
  });

  // --- Document Vault Actions ---
  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);
      try {
        await fetch('/api/brain/vault/upload', {
          method: 'POST',
          body: formData
        });
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploading(false);
    await refreshAll();
  };

  const handleDeleteVaultFile = async (filename) => {
    if (!window.confirm(`Hapus dokumen "${filename}" dari Vault?`)) return;
    try {
      const res = await fetch(`/api/brain/vault/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshAll();
      }
    } catch (err) {
      alert('Gagal menghapus file: ' + err.message);
    }
  };

  const handlePreviewVault = async (filename) => {
    setPreviewFileName(filename);
    setPreviewLoading(true);
    setPreviewContent(null);
    try {
      const res = await fetch(`/api/brain/vault/preview/${encodeURIComponent(filename)}`);
      if (res.ok) {
        const text = await res.text();
        setPreviewContent(text);
      } else {
        setPreviewContent('Gagal memuat pratinjau teks.');
      }
    } catch (err) {
      setPreviewContent('Error: ' + err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Title & Stats */}
      <div className="nes-container is-dark is-rounded" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, margin: '0 0 6px 0', color: 'var(--nes-warning)' }}>
              SECOND BRAIN (KNOWLEDGE & MEMORY VAULT)
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--nes-text-muted)' }}>
              Pusat memori UX terpadu: Catatan Aturan, Framework Heuristik, dan Dokumen yang langsung diinjeksi ke AI saat evaluasi.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div className="nes-badge">
              <span className="is-success" style={{ fontSize: 8 }}>{stats.activeNotes} CATATAN AKTIF</span>
            </div>
            <div className="nes-badge">
              <span className="is-primary" style={{ fontSize: 8 }}>{stats.totalVaultFiles} DOKUMEN VAULT</span>
            </div>
            <div className="nes-badge">
              <span className="is-warning" style={{ fontSize: 8 }}>{stats.totalMemoryItems} TOTAL MEMORI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          className={`nes-btn ${subTab === 'notes' ? 'is-primary' : ''}`}
          onClick={() => setSubTab('notes')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 10 }}
        >
          <BookOpen size={16} />
          <span>CATATAN & ATURAN UX ({notes.length})</span>
        </button>
        <button
          type="button"
          className={`nes-btn ${subTab === 'vault' ? 'is-primary' : ''}`}
          onClick={() => setSubTab('vault')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 10 }}
        >
          <Layers size={16} />
          <span>VAULT DOKUMEN ({vaultFiles.length})</span>
        </button>
      </div>

      {/* TAB 1: CATATAN & ATURAN UX */}
      {subTab === 'notes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Note Input / Editor Form */}
          <div className="nes-container is-dark with-title">
            <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
              {editingNoteId ? 'EDIT CATATAN / ATURAN' : '+ TAMBAH MEMORI / ATURAN BARU KE SECOND BRAIN'}
            </p>
            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="nes-field">
                  <label style={{ fontSize: 9, color: 'var(--nes-warning)' }}>JUDUL ATURAN / INSIGHT</label>
                  <input
                    type="text"
                    className="nes-input is-dark"
                    placeholder="Contoh: Aturan Checkout E-Commerce (Countdown Timer)"
                    value={noteForm.title}
                    onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                    style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div className="nes-field">
                  <label style={{ fontSize: 9, color: 'var(--nes-warning)' }}>TAG / KATEGORI (Pisahkan koma)</label>
                  <input
                    type="text"
                    className="nes-input is-dark"
                    placeholder="Contoh: Checkout, E-Commerce, UX Guideline"
                    value={noteForm.tags}
                    onChange={e => setNoteForm({ ...noteForm, tags: e.target.value })}
                    style={{ fontSize: 13, fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              <div className="nes-field">
                <label style={{ fontSize: 9, color: 'var(--nes-warning)' }}>ISI CATATAN / CHECKLIST HEURISTIK (Markdown Didukung)</label>
                <textarea
                  className="nes-textarea is-dark"
                  rows={6}
                  placeholder="Tuliskan prinsip UX, aturan bisnis, atau kriteria evaluasi spesifik yang harus ditaati oleh AI model..."
                  value={noteForm.content}
                  onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                  style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                {editingNoteId && (
                  <button
                    type="button"
                    className="nes-btn"
                    onClick={() => {
                      setEditingNoteId(null);
                      setNoteForm({ title: '', tags: '', content: '' });
                    }}
                    style={{ fontSize: 9 }}
                  >
                    BATAL
                  </button>
                )}
                <button
                  type="submit"
                  className="nes-btn is-success"
                  style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={14} />
                  <span>{editingNoteId ? 'PERBARUI CATATAN' : 'SIMPAN KE SECOND BRAIN'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="nes-container is-dark is-rounded" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                <input
                  type="text"
                  className="nes-input is-dark"
                  placeholder="🔍 Cari catatan, aturan, atau tag..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', padding: '8px 12px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 9, color: 'var(--nes-text-muted)' }}>TAG:</span>
                <button
                  type="button"
                  className={`nes-btn ${selectedTag === 'ALL' ? 'is-primary' : ''}`}
                  onClick={() => setSelectedTag('ALL')}
                  style={{ fontSize: 8, padding: '4px 8px' }}
                >
                  SEMUA ({notes.length})
                </button>
                {allTags.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`nes-btn ${selectedTag === tag ? 'is-warning' : ''}`}
                    onClick={() => setSelectedTag(tag)}
                    style={{ fontSize: 8, padding: '4px 8px' }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: 16 }}>
            {filteredNotes.length === 0 ? (
              <div className="nes-container is-dark" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32 }}>
                <p style={{ color: 'var(--nes-text-muted)', fontSize: 13, margin: 0 }}>
                  Tidak ada catatan yang cocok dengan pencarian.
                </p>
              </div>
            ) : (
              filteredNotes.map(n => {
                const isActive = n.active !== false;
                return (
                  <div
                    key={n.id}
                    className="nes-container is-dark with-title"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderColor: isActive ? 'var(--nes-success)' : '#4a5568',
                      opacity: isActive ? 1 : 0.75
                    }}
                  >
                    <p className="title" style={{ fontSize: 8, background: '#212529', padding: '0 6px' }}>
                      {n.source === 'migrated_kb' ? 'CORE HEURISTIC' : 'CUSTOM NOTE'}
                    </p>

                    <div>
                      {/* Note Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <h4 style={{ fontSize: 13, margin: 0, color: isActive ? '#fff' : 'var(--nes-text-muted)', lineHeight: 1.4 }}>
                          {n.title}
                        </h4>
                        <span
                          className={`sev-badge ${isActive ? 'sev-0' : 'sev-2'}`}
                          style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onClick={() => handleToggleActive(n.id)}
                          title="Klik untuk mengubah status aktif"
                        >
                          {isActive ? '● AKTIF (AI ON)' : '○ NONAKTIF'}
                        </span>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {(n.tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 10,
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid var(--nes-primary)',
                              padding: '2px 6px',
                              color: '#93c5fd',
                              fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Content Preview */}
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 12,
                        color: '#cbd5e1',
                        lineHeight: 1.6,
                        maxHeight: 160,
                        overflowY: 'auto',
                        background: '#15181c',
                        padding: '10px 12px',
                        border: '1px solid #2d3748',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {n.content}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid #2d3748' }}>
                      <span style={{ fontSize: 10, color: 'var(--nes-text-muted)', fontFamily: 'Inter, sans-serif' }}>
                        Update: {new Date(n.updatedAt || n.createdAt).toLocaleDateString()}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className={`nes-btn ${isActive ? 'is-warning' : 'is-success'}`}
                          onClick={() => handleToggleActive(n.id)}
                          style={{ fontSize: 8, padding: '4px 8px' }}
                        >
                          {isActive ? 'NONAKTIFKAN' : 'AKTIFKAN'}
                        </button>
                        <button
                          type="button"
                          className="nes-btn"
                          onClick={() => handleStartEdit(n)}
                          style={{ fontSize: 8, padding: '4px 8px' }}
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          className="nes-btn is-error"
                          onClick={() => handleDeleteNote(n.id, n.title)}
                          style={{ fontSize: 8, padding: '4px 8px' }}
                        >
                          HAPUS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VAULT DOKUMEN (SLIDES & PDF) */}
      {subTab === 'vault' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* File Drag and Drop Box */}
          <div
            className={`nes-container is-dark with-title ${dragOver ? 'is-rounded' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              handleUploadFiles(e.dataTransfer.files);
            }}
            style={{
              textAlign: 'center',
              padding: '28px 20px',
              borderStyle: dragOver ? 'dashed' : 'solid',
              borderColor: dragOver ? 'var(--nes-primary)' : '#000',
              background: dragOver ? 'rgba(32, 156, 238, 0.1)' : '#212529'
            }}
          >
            <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
              UNGGAH DOKUMEN KE VAULT (SLIDES / PDF / DOCX / MD)
            </p>
            <UploadCloud size={40} style={{ color: 'var(--nes-primary)', marginBottom: 10 }} />
            <p style={{ fontSize: 13, margin: '0 0 10px 0', fontFamily: 'Inter, sans-serif' }}>
              Tarik & lepaskan file presentasi atau pedoman audit ke sini, atau klik tombol di bawah.
            </p>
            <p style={{ fontSize: 11, color: 'var(--nes-text-muted)', margin: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}>
              Format didukung: <strong>PPTX, PPT, PDF, DOCX, TXT, MD</strong> (Maks. 50MB per file).
            </p>

            <label className="nes-btn is-primary" style={{ cursor: 'pointer', fontSize: 9 }}>
              <span>{uploading ? 'SEDANG MEMPROSES...' : 'PILIH FILE DARI KOMPUTER'}</span>
              <input
                type="file"
                multiple
                accept=".pptx,.ppt,.pdf,.docx,.txt,.md"
                onChange={e => handleUploadFiles(e.target.files)}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Vault Files List */}
          <div className="nes-container is-dark with-title">
            <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
              DAFTAR DOKUMEN DALAM VAULT ({vaultFiles.length} FILE)
            </p>

            {vaultFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--nes-text-muted)' }}>
                Belum ada dokumen yang diunggah ke Vault.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {vaultFiles.map(file => {
                  const ext = file.ext || '';
                  let extBadgeClass = 'sev-1';
                  if (['.pptx', '.ppt'].includes(ext)) extBadgeClass = 'sev-3';
                  else if (ext === '.pdf') extBadgeClass = 'sev-4';
                  else if (ext === '.docx') extBadgeClass = 'sev-2';

                  return (
                    <div
                      key={file.filename}
                      className="nes-container is-dark is-rounded"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 16px',
                        background: '#1a1d21'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className={`sev-badge ${extBadgeClass}`} style={{ fontSize: 8, textTransform: 'uppercase' }}>
                          {ext.replace('.', '') || 'DOC'}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
                            {file.filename}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--nes-text-muted)', fontFamily: 'Inter, sans-serif' }}>
                            {(file.size / 1024).toFixed(1)} KB • Diperbarui: {new Date(file.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="nes-btn is-primary"
                          onClick={() => handlePreviewVault(file.filename)}
                          style={{ fontSize: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Eye size={12} />
                          <span>PRATINJAU TEKS</span>
                        </button>
                        <button
                          type="button"
                          className="nes-btn is-error"
                          onClick={() => handleDeleteVaultFile(file.filename)}
                          style={{ fontSize: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Trash2 size={12} />
                          <span>HAPUS</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-App Text Preview Modal */}
      {previewFileName && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 20
        }}>
          <div className="nes-container is-dark with-title" style={{ maxWidth: 840, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
              PRATINJAU EKSTRAKSI TEKS: {previewFileName}
            </p>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: '#15181c',
              padding: 16,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#e2e8f0',
              border: '2px solid #000',
              whiteSpace: 'pre-wrap',
              maxHeight: '60vh'
            }}>
              {previewLoading ? 'Sedang mengekstrak teks dari dokumen...' : (previewContent || 'Teks kosong atau gagal diekstrak.')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button
                type="button"
                className="nes-btn is-error"
                onClick={() => setPreviewFileName('')}
                style={{ fontSize: 9 }}
              >
                TUTUP PRATINJAU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
