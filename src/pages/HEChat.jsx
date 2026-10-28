import React, { useState, useEffect, useRef } from 'react';

export default function HEChat() {
  const [prompt, setPrompt] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [statusLog, setStatusLog] = useState([]);
  const [aiStream, setAiStream] = useState('');

  // Active or selected report (can be null if user chooses not to show history)
  const [activeReport, setActiveReport] = useState(null);
  const [reportsList, setReportsList] = useState([]);

  // Browser Extension & Session Bridge State
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [browserTabs, setBrowserTabs] = useState([]);
  const [selectedTabId, setSelectedTabId] = useState('');
  const [selectedTabInfo, setSelectedTabInfo] = useState(null);
  const [sessionCookies, setSessionCookies] = useState([]);
  const [detectingTabs, setDetectingTabs] = useState(false);
  const [showExtensionHelp, setShowExtensionHelp] = useState(false);

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
    fetchReports(false);

    // Listen for messages from the Chrome Extension content script
    const handleMessage = (event) => {
      if (event.source !== window || !event.data || event.data.source !== 'HE_SUITE_EXT') {
        return;
      }
      const { action, tabs, cookies } = event.data;
      if (action === 'EXTENSION_PONG') {
        setExtensionInstalled(true);
      } else if (action === 'TABS_RESPONSE') {
        setBrowserTabs(tabs || []);
        setDetectingTabs(false);
      } else if (action === 'COOKIES_RESPONSE') {
        setSessionCookies(cookies || []);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check if extension attribute exists on <html>
    if (document.documentElement.getAttribute('data-he-suite-extension') === 'true') {
      setExtensionInstalled(true);
    } else {
      window.postMessage({ source: 'HE_SUITE_PAGE', action: 'CHECK_EXTENSION' }, '*');
    }

    // Custom event listener from extension
    const handleExtReady = () => setExtensionInstalled(true);
    window.addEventListener('he-suite-extension-ready', handleExtReady);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('he-suite-extension-ready', handleExtReady);
    };
  }, []);

  useEffect(() => {
    statusEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [statusLog, aiStream]);

  const handleDetectTabs = () => {
    setDetectingTabs(true);
    window.postMessage({ source: 'HE_SUITE_PAGE', action: 'GET_TABS' }, '*');
    setTimeout(() => {
      setDetectingTabs(false);
    }, 2500);
  };

  const handleSelectTab = (tabId) => {
    setSelectedTabId(tabId);
    if (!tabId) {
      setSelectedTabInfo(null);
      setSessionCookies([]);
      return;
    }
    const tab = browserTabs.find(t => String(t.id) === String(tabId));
    if (tab) {
      setSelectedTabInfo(tab);
      // Auto-fill prompt if empty
      if (!prompt.trim()) {
        setPrompt(`lakukan he untuk website ${tab.url}, dengan case: login form, navigasi akun, riwayat transaksi`);
      }
      // Request cookies for this tab's URL
      window.postMessage({ source: 'HE_SUITE_PAGE', action: 'GET_COOKIES', payload: { url: tab.url } }, '*');
    }
  };

  const handleStartEvaluation = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || evaluating) return;

    setEvaluating(true);
    const startMsg = sessionCookies.length > 0
      ? `[Sistem] Menginisialisasi evaluasi heuristik dengan ${sessionCookies.length} session cookies terinjeksi...`
      : '[Sistem] Menginisialisasi proses evaluasi heuristik...';
    setStatusLog([startMsg]);
    setAiStream('');

    try {
      const response = await fetch('/api/he/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          cookies: sessionCookies
        })
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
        {/* BOX 1: CHAT BOX (TEBAL & LEGA DENGAN SESI BRIDGE) */}
        <div
          className="nes-container is-dark with-title"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 330,
            padding: '16px 18px'
          }}
        >
          <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>
            CHAT BOX: INPUT PERINTAH EVALUASI
          </p>

          <form onSubmit={handleStartEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {/* Auto-detect Tab Session Bar (Anti-Bot / Login Bridge) */}
            <div style={{
              background: '#15181c',
              border: '2px solid #000',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 8, color: 'var(--nes-warning)' }} className="nes-font">
                    SESI BROWSER (LOGIN BYPASS):
                  </span>
                  {extensionInstalled ? (
                    <span className="nes-badge" style={{ verticalAlign: 'middle' }}>
                      <span className="is-success" style={{ fontSize: 7 }}>BRIDGE SIAP</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowExtensionHelp(!showExtensionHelp)}
                      className="nes-btn"
                      style={{ fontSize: 7, padding: '2px 6px', color: '#38bdf8' }}
                    >
                      {showExtensionHelp ? 'TUTUP PANDUAN' : 'PASANG EXTENSION'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="nes-btn is-primary"
                  onClick={handleDetectTabs}
                  disabled={detectingTabs}
                  style={{ fontSize: 8, padding: '4px 8px', whiteSpace: 'nowrap' }}
                >
                  {detectingTabs ? 'MEMINDAI...' : '🔍 DETEKSI TAB BROWSER'}
                </button>
              </div>

              {/* Extension Help Guide Box */}
              {showExtensionHelp && (
                <div style={{
                  background: '#0f172a',
                  border: '1px solid var(--nes-primary)',
                  padding: 10,
                  fontSize: 11,
                  color: '#cbd5e1',
                  lineHeight: 1.5,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <strong style={{ color: 'var(--nes-warning)' }}>Panduan 15 Detik Pasang Extension Bridge:</strong>
                  <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    <li>Buka <code>chrome://extensions</code> di browser dan aktifkan <strong>Developer mode</strong> (kanan atas).</li>
                    <li>Klik tombol <strong>Load unpacked</strong> (kiri atas).</li>
                    <li>Pilih folder: <code>hesuite/extension</code> di repository ini.</li>
                    <li>Refresh tab ini, lalu klik tombol <strong>DETEKSI TAB BROWSER</strong>!</li>
                  </ol>
                </div>
              )}

              {/* Dropdown Tab Picker */}
              {browserTabs.length > 0 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="nes-select is-dark" style={{ flex: 1 }}>
                    <select
                      value={selectedTabId}
                      onChange={(e) => handleSelectTab(e.target.value)}
                      style={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">-- Pilih Tab Browser yang Sudah Login --</option>
                      {browserTabs.map(t => {
                        let host = '';
                        try { host = new URL(t.url).hostname; } catch {}
                        return (
                          <option key={t.id} value={t.id}>
                            {t.title.slice(0, 42)} {host ? `(${host})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {sessionCookies.length > 0 && (
                    <button
                      type="button"
                      className="nes-btn is-error"
                      onClick={() => handleSelectTab('')}
                      style={{ fontSize: 8, padding: '4px 8px' }}
                      title="Reset Sesi"
                    >
                      RESET
                    </button>
                  )}
                </div>
              )}

              {/* Active Session Info Badge */}
              {selectedTabInfo && sessionCookies.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--nes-success)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>✓ Sesi Terhubung:</span>
                  <strong style={{ color: '#fff' }}>{selectedTabInfo.title.slice(0, 32)}</strong>
                  <span>({sessionCookies.length} cookies otomatis diinjeksi)</span>
                </div>
              )}
            </div>

            {/* Prompt Textarea */}
            <textarea
              className="nes-textarea is-dark"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={evaluating}
              placeholder="Contoh: lakukan he untuk website https://tokopedia.com, dengan case: login, lupa password, pencarian produk, checkout..."
              style={{
                flex: 1,
                minHeight: 110,
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
            minHeight: 330,
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
              maxHeight: 250,
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
                <div>• Session Bridge siap menginjeksi sesi login dari tab browser.</div>
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

          {/* Export Buttons */}
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
