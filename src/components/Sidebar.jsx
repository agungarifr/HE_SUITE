import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, hasApiKey, kbCount }) {
  const menuItems = [
    {
      id: 'he',
      title: 'EVALUASI HE',
      sub: 'Audit Heuristik AI',
      icon: 'coin'
    },
    {
      id: 'kb',
      title: 'KNOWLEDGE BASE',
      sub: `${kbCount} Dokumen Aktif`,
      icon: 'star'
    },
    {
      id: 'config',
      title: 'MODEL AI & KEY',
      sub: hasApiKey ? 'Kunci Aktif (.env)' : 'Perlu API Key',
      icon: 'trophy'
    }
  ];

  return (
    <aside className="nes-sidebar">
      {/* Brand Header */}
      <div className="nes-container is-dark is-rounded" style={{ padding: '14px 10px', textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 14, margin: 0, color: 'var(--nes-warning)' }}>
          HE SUITE
        </h1>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nes-btn ${isActive ? 'is-primary' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '12px 14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className={`nes-icon ${item.icon} is-small`}></i>
                <span style={{ fontSize: 9 }}>{item.title}</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: isActive ? '#fff' : 'var(--nes-text-muted)', marginLeft: 26 }}>
                {item.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Box */}
      <div className="nes-container is-dark with-title" style={{ marginTop: 'auto', padding: '14px 10px' }}>
        <p className="title" style={{ fontSize: 8, background: '#212529', padding: '0 6px' }}>STATUS AI AGENT</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <i className={`nes-icon is-small ${hasApiKey ? 'heart' : 'heart is-empty'}`}></i>
          <span style={{ fontSize: 8 }} className="nes-font">
            {hasApiKey ? 'MODEL SIAP' : 'KUNCI KOSONG'}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--nes-text-muted)', lineHeight: 1.4 }}>
          {hasApiKey ? 'Koneksi AI aktif & siap evaluasi.' : 'Atur API key di tab Model AI.'}
        </p>
      </div>
    </aside>
  );
}
