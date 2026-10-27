import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HEChat from './pages/HEChat';
import KnowledgeBase from './pages/KnowledgeBase';
import ModelConfig from './pages/ModelConfig';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('he');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [kbCount, setKbCount] = useState(0);

  const checkStatus = async () => {
    try {
      const cfgRes = await fetch('/api/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setHasApiKey(cfg.hasKey);
      }
      const kbRes = await fetch('/api/kb');
      if (kbRes.ok) {
        const kbs = await kbRes.json();
        setKbCount(kbs.length);
      }
    } catch (err) {
      console.warn('Could not check system status:', err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [activeTab]);

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={hasApiKey}
        kbCount={kbCount}
      />
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {activeTab === 'he' && <HEChat />}
        {activeTab === 'kb' && <KnowledgeBase onKbChanged={(cnt) => setKbCount(cnt)} />}
        {activeTab === 'config' && <ModelConfig onConfigUpdated={checkStatus} />}
      </main>
    </div>
  );
}
