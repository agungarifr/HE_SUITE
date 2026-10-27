import React, { useState, useEffect, useRef } from 'react';

export default function HEChat() {
  const [prompt, setPrompt] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [statusLog, setStatusLog] = useState([]);
  const [aiStream, setAiStream] = useState('');

  // Active or selected report
  const [activeReport, setActiveReport] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  const statusEndRef = useRef(null);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/he/reports');
      if (res.ok) {
        const data = await res.json();
        setReportsList(data);
        if (data.length > 0 && !activeReport) {
          setActiveReport(data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    statusEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [statusLog]);

  const handleStartEvaluation = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || evaluating) return;

    setEvaluating(true);
    setStatusLog(['Memulai proses evaluasi heuristik...']);
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
                await fetchReports();
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
    'lakukan he untuk website https://news.ycombinator.com, dengan case: membaca berita, navigasi komentar, search berita',
    'lakukan he untuk website https://github.com, dengan case: pencarian repo, login form, profil pengguna'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* Top Banner with Controls */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 10, background: '#212529', padding: '0 8px' }}>EVALUASI HEURISTIK (HE CHAT)</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--nes-text-muted)' }}>
              Ketik prompt audit website & use cases. Model AI akan merayapi DOM dan mengevaluasi pelanggaran heuristik.
            </p>
          </div>

          {/* History Selector & Export Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10, color: 'var(--nes-warning)' }} className="nes-font">RIWAYAT:</span>
            <div className="nes-select is-dark" style={{ width: 'auto', minWidth: 260 }}>
              <select
                value={activeReport?.id || ''}
                onChange={(e) => {
                  const found = reportsList.find(r => r.id === e.target.value);
                  if (found) setActiveReport(found);
                }}
                style={{ fontSize: 12 }}
              >
                {reportsList.length === 0 ? (
                  <option value="">Belum ada riwayat</option>
                ) : (
                  reportsList.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.website} ({new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))
                )}
              </select>
            </div>

            {activeReport && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="nes-btn is-success"
                  onClick={() => handleExportExcel(activeReport.id)}
                  title="Unduh File Excel (.xlsx)"
                  style={{ fontSize: 9, padding: '4px 10px' }}
                >
                  EXCEL
                </button>
                <button
                  type="button"
                  className="nes-btn"
                  onClick={() => handleExportJson(activeReport)}
                  title="Unduh JSON"
                  style={{ fontSize: 9, padding: '4px 10px' }}
                >
                  JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Prompt Box */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>INPUT PERINTAH EVALUASI</p>
        <form onSubmit={handleStartEvaluation} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            className="nes-input is-dark"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={evaluating}
            placeholder="Contoh: lakukan he untuk website tokopedia.com, dengan case: login, lupa password, register"
            style={{ flex: 1, fontSize: 13 }}
          />
          <button
            type="submit"
            className="nes-btn is-primary"
            disabled={evaluating || !prompt.trim()}
            style={{ fontSize: 10, whiteSpace: 'nowrap' }}
          >
            {evaluating ? 'MENELUSURI...' : 'MULAI HE'}
          </button>
        </form>

        {/* Example Prompt Chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--nes-text-muted)' }}>Contoh prompt:</span>
          {examplePrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              className="nes-btn"
              onClick={() => setPrompt(p)}
              disabled={evaluating}
              style={{ fontSize: 9, padding: '2px 8px' }}
            >
              {p.slice(0, 52)}...
            </button>
          ))}
        </div>
      </div>

      {/* Live Status Log */}
      {evaluating && (
        <div className="nes-container is-dark is-rounded" style={{ maxHeight: 150, overflowY: 'auto', padding: '12px 16px' }}>
          <p className="nes-font" style={{ fontSize: 9, color: 'var(--nes-warning)', margin: '0 0 8px 0' }}>
            STATUS PENELUSURAN REAL-TIME:
          </p>
          {statusLog.map((log, idx) => (
            <div key={idx} style={{ fontSize: 12, color: log.includes('[ERROR]') ? 'var(--nes-error)' : 'var(--nes-text-muted)', margin: '3px 0' }}>
              &gt; {log}
            </div>
          ))}
          <div ref={statusEndRef} />
        </div>
      )}

      {/* Streaming Narrative Box */}
      {evaluating && aiStream && (
        <div className="nes-container is-dark with-title">
          <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>OUTPUT AI (STREAMING)</p>
          <div style={{
            whiteSpace: 'pre-wrap',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 13,
            lineHeight: 1.6,
            maxHeight: 220,
            overflowY: 'auto'
          }}>
            {aiStream}
          </div>
        </div>
      )}

      {/* Active Findings Report */}
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
        <div className="nes-container is-dark is-rounded" style={{ padding: 40, textAlign: 'center', color: 'var(--nes-text-muted)' }}>
          <i className="nes-icon is-large heart is-empty" style={{ margin: '0 auto 16px', display: 'block' }}></i>
          <p className="nes-font" style={{ fontSize: 12, color: 'var(--nes-warning)', margin: '0 0 8px 0' }}>
            BELUM ADA EVALUASI AKTIF
          </p>
          <p style={{ margin: 0, fontSize: 13 }}>
            Ketik URL website dan skenario use cases di kotak atas untuk memulai penelusuran heuristik.
          </p>
        </div>
      )}
    </div>
  );
}
