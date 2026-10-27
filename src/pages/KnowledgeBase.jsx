import React, { useState, useEffect } from 'react';

export default function KnowledgeBase({ onKbChanged }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // New rule state
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kb');
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
        if (onKbChanged) onKbChanged(data.length);
      }
    } catch (err) {
      console.error('Error fetching KB files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/kb/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        await fetchFiles();
      } else {
        const err = await res.json();
        alert(`Gagal upload file: ${err.error}`);
      }
    } catch (err) {
      alert(`Error upload: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm(`Hapus file knowledge base: ${filename}?`)) return;
    try {
      const res = await fetch(`/api/kb/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        if (previewFile === filename) setPreviewFile(null);
        await fetchFiles();
      }
    } catch (err) {
      alert(`Error delete: ${err.message}`);
    }
  };

  const handlePreview = async (filename) => {
    setPreviewFile(filename);
    setPreviewLoading(true);
    setPreviewContent('');
    try {
      const res = await fetch(`/api/kb/preview/${filename}`);
      if (res.ok) {
        const text = await res.text();
        setPreviewContent(text);
      } else {
        setPreviewContent('Gagal memuat teks dari dokumen.');
      }
    } catch (err) {
      setPreviewContent(`Error: ${err.message}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveNewRule = async (e) => {
    e.preventDefault();
    if (!newRuleName.trim()) return alert('Nama file harus diisi.');
    try {
      const res = await fetch('/api/kb/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: newRuleName.trim(),
          content: newRuleContent
        })
      });
      if (res.ok) {
        setIsCreatingRule(false);
        setNewRuleName('');
        setNewRuleContent('');
        await fetchFiles();
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 10, background: '#212529', padding: '0 8px' }}>KNOWLEDGE BASE CMS</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--nes-text-muted)' }}>
            Unggah dokumen pedoman desain (PPT, PPTX, PDF, DOCX, TXT, MD). Teks diekstrak otomatis sebagai konteks evaluasi AI.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="nes-btn" onClick={fetchFiles} disabled={loading} style={{ fontSize: 10 }}>
              SEGARKAN
            </button>
            <button className="nes-btn is-primary" onClick={() => setIsCreatingRule(true)} style={{ fontSize: 10 }}>
              + ATURAN TEKS
            </button>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div
        className="nes-container is-dark is-rounded"
        style={{
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          borderStyle: 'dashed'
        }}
        onClick={() => document.getElementById('kb-file-input').click()}
      >
        <input
          id="kb-file-input"
          type="file"
          accept=".pptx,.ppt,.pdf,.docx,.doc,.txt,.md,.json,.csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <div style={{ marginBottom: 10 }}>
          <i className="nes-icon is-medium trophy"></i>
        </div>
        <p className="nes-font" style={{ fontSize: 11, color: 'var(--nes-warning)', margin: '0 0 8px 0' }}>
          {uploading ? 'MEMPROSES & MENGEKSTRAK DOKUMEN...' : '[ KLIK / UNGGAH DOKUMEN KE SINI ]'}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--nes-text-muted)' }}>
          Mendukung PPT, PPTX, PDF, DOCX, TXT, dan Markdown (Maksimal 50MB)
        </p>
      </div>

      {/* New Rule Modal / Form */}
      {isCreatingRule && (
        <div className="nes-container is-dark with-title" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>BUAT ATURAN BARU (.MD)</p>
          <input
            type="text"
            className="nes-input is-dark"
            placeholder="nama_aturan_baru (contoh: pedoman_kontras_warna)"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            style={{ fontSize: 13 }}
          />
          <textarea
            className="nes-textarea is-dark"
            placeholder="# Pedoman Desain Heuristik&#10;- Kontras warna minimal 4.5:1&#10;- Tombol aksi harus tampak jelas"
            value={newRuleContent}
            onChange={(e) => setNewRuleContent(e.target.value)}
            rows={6}
            style={{ fontSize: 13, fontFamily: 'monospace' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="nes-btn" onClick={() => setIsCreatingRule(false)} style={{ fontSize: 10 }}>BATAL</button>
            <button className="nes-btn is-success" onClick={handleSaveNewRule} style={{ fontSize: 10 }}>SIMPAN ATURAN</button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
          DOKUMEN KNOWLEDGE BASE AKTIF ({files.length})
        </p>

        {files.length === 0 ? (
          <p style={{ margin: '16px 0', textAlign: 'center', color: 'var(--nes-text-muted)' }}>
            Belum ada dokumen. Unggah dokumen pedoman desain atau PPT di atas.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {files.map((file, idx) => (
              <div
                key={idx}
                className="nes-container is-dark is-rounded"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <i className="nes-icon is-small coin"></i>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#fff', wordBreak: 'break-all' }}>
                      {file.filename}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--nes-text-muted)', marginTop: 2 }}>
                      Ukuran: {(file.size / 1024).toFixed(1)} KB | Diperbarui: {new Date(file.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                  <button
                    className="nes-btn is-primary"
                    onClick={() => handlePreview(file.filename)}
                    style={{ fontSize: 9, padding: '4px 10px' }}
                  >
                    PREVIEW
                  </button>
                  <button
                    className="nes-btn is-error"
                    onClick={() => handleDelete(file.filename)}
                    style={{ fontSize: 9, padding: '4px 10px' }}
                  >
                    HAPUS
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 24
        }}>
          <div className="nes-container is-dark with-title" style={{
            width: '100%',
            maxWidth: 860,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 20
          }}>
            <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
              PRATINJAU TEKS: {previewFile}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--nes-text-muted)' }}>
                Teks yang diekstrak dan dibaca oleh model AI saat evaluasi:
              </span>
              <button className="nes-btn is-error" onClick={() => setPreviewFile(null)} style={{ fontSize: 8, padding: '2px 8px' }}>
                X
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '55vh',
              background: '#15171c',
              border: '2px solid #000',
              padding: 16,
              borderRadius: 4
            }}>
              {previewLoading ? (
                <p style={{ textAlign: 'center', padding: 20, color: 'var(--nes-text-muted)' }}>
                  Mengekstrak dan membaca teks dokumen...
                </p>
              ) : (
                <pre style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#e2e8f0'
                }}>
                  {previewContent}
                </pre>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
              <button className="nes-btn" onClick={() => setPreviewFile(null)} style={{ fontSize: 10 }}>
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
