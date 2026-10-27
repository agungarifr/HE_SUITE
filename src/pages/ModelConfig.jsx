import React, { useState, useEffect } from 'react';

export default function ModelConfig({ onConfigUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-4o');
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  const presets = [
    {
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    },
    {
      name: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4o-mini'
    },
    {
      name: 'Google Gemini (AI Studio)',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      model: 'gemini-2.0-flash'
    },
    {
      name: 'OpenAI (GPT-4o)',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o'
    },
    {
      name: 'Groq (Llama 3.3)',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile'
    },
    {
      name: 'Ollama (Local)',
      baseUrl: 'http://localhost:11434/v1',
      model: 'llama3'
    }
  ];

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setBaseUrl(data.baseUrl || 'https://api.openai.com/v1');
        setModel(data.model || 'gpt-4o');
        setHasKey(data.hasKey);
        setMaskedKey(data.apiKeyMasked || '');
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMessage(null);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          baseUrl: baseUrl.trim(),
          model: model.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage({ type: 'success', text: 'Konfigurasi berhasil disimpan ke file .env!' });
        setApiKey('');
        fetchConfig();
        if (onConfigUpdated) onConfigUpdated();
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Gagal menyimpan konfigurasi.' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
          baseUrl: baseUrl.trim(),
          model: model.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error });
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 10, background: '#212529', padding: '0 8px' }}>KONFIGURASI MODEL AI</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--nes-text-muted)' }}>
          Atur provider model AI yang kompatibel dengan format OpenAI (OpenAI, Groq, Ollama, vLLM). Kunci API disimpan dengan aman di file <code>.env</code> di root project.
        </p>
      </div>

      {saveMessage && (
        <div className={`nes-container is-rounded ${saveMessage.type === 'success' ? 'is-dark' : 'is-dark'}`} style={{
          borderColor: saveMessage.type === 'success' ? 'var(--nes-success)' : 'var(--nes-error)',
          padding: '12px 16px'
        }}>
          <span style={{ color: saveMessage.type === 'success' ? 'var(--nes-success)' : 'var(--nes-error)', fontWeight: 600 }}>
            {saveMessage.text}
          </span>
        </div>
      )}

      {testResult && (
        <div className="nes-container is-rounded is-dark" style={{
          borderColor: testResult.success ? 'var(--nes-success)' : 'var(--nes-error)',
          padding: '12px 16px'
        }}>
          <span style={{ color: testResult.success ? 'var(--nes-success)' : 'var(--nes-error)', fontWeight: 600 }}>
            {testResult.message}
          </span>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="nes-container is-dark with-title">
        <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>PRESET CEPAT</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="nes-btn"
              onClick={() => {
                setBaseUrl(p.baseUrl);
                setModel(p.model);
              }}
              style={{ fontSize: 10 }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave} className="nes-container is-dark with-title" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="title" style={{ fontSize: 9, background: '#212529', padding: '0 8px' }}>PARAMETER MODEL</p>

        <div className="nes-field">
          <label style={{ fontSize: 10, color: 'var(--nes-warning)', marginBottom: 6, display: 'block' }} className="nes-font">
            API KEY:
          </label>
          <input
            type="password"
            className="nes-input is-dark"
            placeholder={hasKey ? `Tersimpan (${maskedKey}). Ketik jika ingin ganti.` : 'sk-...'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ fontSize: 13 }}
          />
          <span style={{ fontSize: 12, color: 'var(--nes-text-muted)', marginTop: 4, display: 'block' }}>
            {hasKey ? 'Status: Kunci aktif tersimpan di .env' : 'Kunci belum diatur.'}
          </span>
        </div>

        <div className="nes-field">
          <label style={{ fontSize: 10, color: 'var(--nes-warning)', marginBottom: 6, display: 'block' }} className="nes-font">
            BASE URL:
          </label>
          <input
            type="text"
            className="nes-input is-dark"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            style={{ fontSize: 13 }}
          />
        </div>

        <div className="nes-field">
          <label style={{ fontSize: 10, color: 'var(--nes-warning)', marginBottom: 6, display: 'block' }} className="nes-font">
            NAMA MODEL:
          </label>
          <input
            type="text"
            className="nes-input is-dark"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
          <button
            type="button"
            className="nes-btn is-warning"
            onClick={handleTest}
            disabled={testing || (!hasKey && !apiKey)}
            style={{ fontSize: 10 }}
          >
            {testing ? 'Menguji...' : 'UJI KONEKSI'}
          </button>

          <button
            type="submit"
            className="nes-btn is-success"
            disabled={loading}
            style={{ fontSize: 10 }}
          >
            SIMPAN KE .ENV
          </button>
        </div>
      </form>
    </div>
  );
}
