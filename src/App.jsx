import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HEChat from './pages/HEChat';
import SecondBrain from './pages/SecondBrain';
import ModelConfig from './pages/ModelConfig';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('he');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [brainCount, setBrainCount] = useState(0);

  const checkStatus = async () => {
    try {
      const cfgRes = await fetch('/api/config');
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setHasApiKey(cfg.hasKey);
      }
      const brainRes = await fetch('/api/brain/stats');
      if (brainRes.ok) {
        const stats = await brainRes.json();
        setBrainCount(stats.totalMemoryItems || 0);
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
        brainCount={brainCount}
      />
      <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {activeTab === 'he' && <HEChat />}
        {(activeTab === 'brain' || activeTab === 'kb') && (
          <SecondBrain onBrainChanged={(cnt) => setBrainCount(cnt)} />
        )}
        {activeTab === 'config' && <ModelConfig onConfigUpdated={checkStatus} />}
      </main>
    </div>
  );
}
