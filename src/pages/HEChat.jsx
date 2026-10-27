import React, { useState, useEffect, useRef } from 'react';

export default function HEChat() {
  const [prompt, setPrompt] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [statusLog, setStatusLog] = useState([]);
  const [aiStream, setAiStream] = useState('');

  // Active or selected report (can be null if user chooses not to show history)
  const [activeReport, setActiveReport] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  const statusEndRef = useRef(null);

  const fetchReports = async (selectLatest = false) => {
    try {
      const res = await fetch('/api/he/reports');
      if (res.ok) {
        const data = await res.json();
        setReportsList(data);
        if (selectLatest && data.length > 0) {
          setActiveReport(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    // Initial fetch, load reports list
    fetchReports(false);
  }, []);

  useEffect(() => {
    statusEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [statusLog, aiStream]);

  const handleStartEvaluation = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || evaluating) return;

    setEvaluating(true);
    setStatusLog(['[Sistem] Menginisialisasi proses evaluasi heuristik...']);
    setAiStream('');

    try {
      const response = await fetch('/api/he/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (event.type === 'status') {
                setStatusLog(prev => [...prev, event.data]);
              } else if (event.type === 'chunk') {
                setAiStream(prev => prev + event.data);
              } else if (event.type === 'done') {
                setActiveReport(event.data.report);
                await fetchReports(false);
              } else if (event.type === 'error') {
                setStatusLog(prev => [...prev, `[ERROR] ${event.data}`]);
              }
            } catch (err) {
              console.warn('Error parsing SSE data:', err);
            }
          }
        }
      }
    } catch (err) {
      setStatusLog(prev => [...prev, `[GAGAL] ${err.message}`]);
    } finally {
      setEvaluating(false);
    }
  };

  const handleExportExcel = (reportId) => {
    if (!reportId) return;
    window.open(`/api/he/reports/${reportId}/export/excel`, '_blank');
  };

  const handleExportJson = (report) => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `HE_Report_${report.id || 'export'}.json`;
    a.click();
  };

  const examplePrompts = [
    'lakukan he untuk website https://news.ycombinator.com, dengan case: membaca berita, navigasi komentar, search',
    'lakukan he untuk website https://github.com, dengan case: login form, pencarian repo, profil akun'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* Top Banner Header */}
      <div className="nes-container is-dark with-title" style={{ padding: '14px 20px' }}>
        <p className="title" style={{ fontSize: 10, background: '#212529', padding: '0 8px' }}>
          EVALUASI HEURISTIK (HE CHAT)
        </p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--nes-text-muted)', fontFamily: 'Inter, sans-serif' }}>
          Ketik instruksi audit di chat box. AI Agent akan menelusuri DOM website secara otomatis, mencocokkan dengan aturan Second Brain, dan menyajikan tabel temuan.
        </p>
      </div>

      {/* Grid: Chat Box & Log Chat AI (Ukuran & Proporsi Seimbang) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 20 }}>
        {/* BOX 1: CHAT BOX (TEBAL & LEGA) */}
        <div
          className="nes-container is-dark with-title"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 280,
            padding: '16px 18px'
          }}
        >
          <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
            CHAT BOX: INPUT PERINTAH EVALUASI
          </p>

          <form onSubmit={handleStartEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <textarea
              className="nes-textarea is-dark"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={evaluating}
              placeholder="Contoh: lakukan he untuk website https://tokopedia.com, dengan case: login, lupa password, pencarian produk, checkout..."
              style={{
                flex: 1,
                minHeight: 130,
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.5,
                resize: 'none',
                padding: '12px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--nes-text-muted)', fontFamily: 'Inter, sans-serif' }}>Contoh:</span>
                {examplePrompts.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    className="nes-btn"
                    onClick={() => setPrompt(p)}
                    disabled={evaluating}
                    style={{ fontSize: 8, padding: '3px 8px' }}
                  >
                    Preset {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="nes-btn is-primary"
                disabled={evaluating || !prompt.trim()}
                style={{ fontSize: 10, padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                {evaluating ? 'MENELUSURI...' : 'MULAI HE'}
              </button>
            </div>
          </form>
        </div>

        {/* BOX 2: LOG CHAT DENGAN AI (UKURAN SAMA PERSIS DENGAN CHAT BOX) */}
        <div
          className="nes-container is-dark with-title"
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 280,
            padding: '16px 18px'
          }}
        >
          <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
            LOG CHAT DENGAN AI AGENT
          </p>

          <div
            style={{
              flex: 1,
              background: '#15181c',
              border: '2px solid #000',
              padding: '12px 14px',
              overflowY: 'auto',
              maxHeight: 210,
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 12,
              lineHeight: 1.6
            }}
          >
            {statusLog.length === 0 && !aiStream && (
              <div style={{ color: 'var(--nes-text-muted)', fontFamily: 'Inter, sans-serif', fontSize: 12, lineHeight: 1.6 }}>
                <div style={{ color: 'var(--nes-warning)', fontWeight: 700, marginBottom: 6 }}>
                  [AI AGENT STANDBY]
                </div>
                <div>• Crawler Puppeteer siap menelusuri DOM & mendeteksi error console.</div>
                <div>• Memori Second Brain siap diinjeksi sebagai standar heuristik.</div>
                <div style={{ marginTop: 8, color: '#94a3b8' }}>
                  Ketik URL & use case pada chat box di sebelah, lalu klik <strong>MULAI HE</strong>.
                </div>
              </div>
            )}

            {/* Status Steps */}
            {statusLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  color: log.includes('[ERROR]') || log.includes('[GAGAL]') ? 'var(--nes-error)' : '#38bdf8',
                  marginBottom: 4,
                  wordBreak: 'break-word'
                }}
              >
                &gt; {log}
              </div>
            ))}

            {/* Streaming Text Delta */}
            {aiStream && (
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #334155', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                {aiStream}
              </div>
            )}
            <div ref={statusEndRef} />
          </div>
        </div>
      </div>

      {/* SELECTOR RIWAYAT (DITARUH TEPAT DI BAWAH LOG CHAT & CHAT BOX) */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
          SELECTOR RIWAYAT LAPORAN
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Dropdown Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 320 }}>
            <span style={{ fontSize: 9, color: 'var(--nes-warning)' }} className="nes-font">PILIH RIWAYAT:</span>
            <div className="nes-select is-dark" style={{ flex: 1, maxWidth: 540 }}>
              <select
                value={activeReport?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setActiveReport(null);
                  } else {
                    const found = reportsList.find(r => r.id === val);
                    setActiveReport(found || null);
                  }
                }}
                style={{ fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">-- JANGAN TAMPILKAN RIWAYAT APAPUN (KOSONGKAN) --</option>
                {reportsList.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.website} ({new Date(r.createdAt).toLocaleDateString()}) • {(r.findings || []).length} Temuan
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Tutup / Kosongkan Riwayat */}
            {activeReport && (
              <button
                type="button"
                className="nes-btn is-error"
                onClick={() => setActiveReport(null)}
                style={{ fontSize: 8, padding: '4px 10px', whiteSpace: 'nowrap' }}
                title="Sembunyikan laporan"
              >
                TUTUP RIWAYAT
              </button>
            )}
          </div>

          {/* Export Buttons (Muncul jika ada laporan yang dipilih) */}
          {activeReport && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="nes-btn is-success"
                onClick={() => handleExportExcel(activeReport.id)}
                title="Unduh File Excel (.xlsx)"
                style={{ fontSize: 9, padding: '6px 12px' }}
              >
                EKSPOR EXCEL
              </button>
              <button
                type="button"
                className="nes-btn"
                onClick={() => handleExportJson(activeReport)}
                title="Unduh JSON"
                style={{ fontSize: 9, padding: '6px 12px' }}
              >
                EKSPOR JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ACTIVE FINDINGS REPORT OR EMPTY STATE */}
      {activeReport ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header Stats Box */}
          <div className="nes-container is-dark is-rounded" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="nes-badge" style={{ verticalAlign: 'middle' }}>
                  <span className="is-primary" style={{ fontSize: 9 }}>{activeReport.id}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--nes-warning)' }}>
                  {activeReport.website}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: 12, color: 'var(--nes-text-muted)' }}>
                {activeReport.summary || activeReport.prompt}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--nes-primary)' }} className="nes-font">
                {(activeReport.findings || []).length} TEMUAN
              </div>
              <span style={{ fontSize: 11, color: 'var(--nes-text-muted)' }}>
                {new Date(activeReport.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* High-Readability NES Data Table with Horizontal Scroll */}
          <div className="nes-container is-dark with-title" style={{ padding: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '2px solid #000' }}>
              <p className="title" style={{ fontSize: 9, margin: 0, background: '#212529', padding: '0 8px' }}>
                TABEL TEMUAN HEURISTIK (STRUCTURED FINDINGS)
              </p>
              <span style={{ fontSize: 11, color: 'var(--nes-warning)' }}>
                ↔ Geser horizontal untuk melihat detail lengkap
              </span>
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
              <table className="nes-data-table" style={{ minWidth: 1300, width: '100%', margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>ID & TIPE</th>
                    <th style={{ width: '120px' }}>SEVERITY</th>
                    <th style={{ width: '220px' }}>HEURISTIK / KATEGORI</th>
                    <th style={{ width: '380px' }}>DETAIL MASALAH</th>
                    <th style={{ width: '340px' }}>REKOMENDASI PERBAIKAN</th>
                    <th style={{ width: '120px' }}>KONTEKS CASE</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeReport.findings || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--nes-text-muted)' }}>
                        Tidak ada temuan anomali dalam laporan evaluasi ini.
                      </td>
                    </tr>
                  ) : (
                    activeReport.findings.map((f, idx) => {
                      const sev = f.Severity ?? 2;
                      let sevClass = 'sev-2';
                      let sevText = `Sev ${sev}`;
                      if (sev === 0) { sevClass = 'sev-0'; sevText = '0 - Kosmetik'; }
                      else if (sev === 1) { sevClass = 'sev-1'; sevText = '1 - Minor'; }
                      else if (sev === 2) { sevClass = 'sev-2'; sevText = '2 - Moderate'; }
                      else if (sev === 3) { sevClass = 'sev-3'; sevText = '3 - Major'; }
                      else if (sev >= 4) { sevClass = 'sev-4'; sevText = '4 - Blocker'; }

                      const isFunctional = f.Type === 'Functional';

                      return (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>
                              {f.ID || `HE-${idx + 1}`}
                            </div>
                            <span className="sev-badge" style={{
                              background: isFunctional ? 'var(--nes-error)' : 'var(--nes-primary)',
                              color: '#fff',
                              fontSize: 7
                            }}>
                              {isFunctional ? 'BUG' : 'UX ISSUE'}
                            </span>
                          </td>
                          <td>
                            <span className={`sev-badge ${sevClass}`}>
                              {sevText}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--nes-warning)' }}>
                            {f.Heuristic_Type || '-'}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>
                              {f.Issue_Title}
                            </div>
                            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                              {f.Description}
                            </div>
                          </td>
                          <td>
                            {f.Recommendation ? (
                              <div style={{
                                background: 'rgba(146, 204, 65, 0.12)',
                                borderLeft: '4px solid var(--nes-success)',
                                padding: '8px 10px',
                                fontSize: 13,
                                color: '#a3e635',
                                lineHeight: 1.5
                              }}>
                                {f.Recommendation}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--nes-text-muted)', fontSize: 12 }}>-</span>
                            )}
                          </td>
                          <td>
                            <span className="sev-badge sev-1">
                              {f.User_Story_Context || 'Global'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state saat user memilih tidak menampilkan riwayat apapun */
        <div className="nes-container is-dark is-rounded" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--nes-text-muted)' }}>
          <i className="nes-icon is-medium heart is-empty" style={{ margin: '0 auto 12px', display: 'block' }}></i>
          <p className="nes-font" style={{ fontSize: 10, color: 'var(--nes-warning)', margin: '0 0 8px 0' }}>
            TIDAK ADA RIWAYAT YANG DITAMPILKAN
          </p>
          <p style={{ margin: 0, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
            Pilih laporan dari dropdown <strong>PILIH RIWAYAT</strong> di atas, atau masukkan instruksi di chat box untuk memulai audit baru.
          </p>
        </div>
      )}
    </div>
  );
}
