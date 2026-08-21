import React, { useState, useEffect } from 'react';
import { Activity, BookOpen, Download, AlertCircle, RefreshCw, Database, Edit3, Trash2, Plus, Save, X, Terminal, CheckCircle2, TerminalSquare } from 'lucide-react';
import WebTerminal from './WebTerminal';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [userStories, setUserStories] = useState([]);
  const [kbFiles, setKbFiles] = useState([]);
  const [editingKbFile, setEditingKbFile] = useState(null); 
  const [editingStory, setEditingStory] = useState(null); // CMS state for stories
  const [selectedStoryId, setSelectedStoryId] = useState(null); // For 2-column view
  const [selectedReportId, setSelectedReportId] = useState(null); // For dashboard 2-column view
  const [isLoading, setIsLoading] = useState(false);
  const [installedAgents, setInstalledAgents] = useState([]);
  const [connectingAgent, setConnectingAgent] = useState(null);
  const [launchingAgent, setLaunchingAgent] = useState(null);
  const [activeAgentTerminal, setActiveAgentTerminal] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const reportsRes = await fetch('/data/reports.json?' + new Date().getTime());
      if (reportsRes.ok) setReports(await reportsRes.json());
      
      await fetchStories();
      if (activeTab === 'kb') await fetchKbFiles();
      if (activeTab === 'integrations') await fetchAgents();
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKbFiles = async () => {
    try {
      const res = await fetch('/api/kb');
      if (res.ok) setKbFiles(await res.json());
    } catch (e) { console.error("Error fetching KB files", e); }
  };

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories?' + new Date().getTime());
      if (res.ok) setUserStories(await res.json());
    } catch (e) { console.error("Error fetching stories", e); }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents?' + new Date().getTime());
      if (res.ok) setInstalledAgents(await res.json());
    } catch (e) { console.error("Error fetching agents", e); }
  };

  const resetConnections = async () => {
    if (!confirm('Are you sure you want to remove all agent MCP connections?')) return;
    try {
      const res = await fetch('/api/agents/reset', { method: 'POST' });
      if (res.ok) {
        await fetchAgents();
      } else {
        alert('Failed to reset connections.');
      }
    } catch (e) {
      alert(`Error resetting connections: ${e.message}`);
    }
  };

  const connectAgent = async (agentId) => {
    setConnectingAgent(agentId);
    try {
      const res = await fetch('/api/agents/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      if (res.ok) {
        setInstalledAgents(prev => prev.map(a => a.id === agentId ? { ...a, isConnected: true } : a));
      } else {
        alert(`Failed to connect ${agentId}.`);
      }
    } catch (e) {
      alert(`Error connecting ${agentId}: ${e.message}`);
    } finally {
      setConnectingAgent(null);
    }
  };

  const launchAgent = async (agentId) => {
    // If it's a CLI tool, launch it in the embedded Web Terminal instead!
    if (agentId === 'freebuff' || agentId === 'antigravity') {
      setActiveAgentTerminal(agentId);
      setActiveTab('terminal');
      return;
    }

    setLaunchingAgent(agentId);
    try {
      const res = await fetch('/api/agents/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to launch ${agentId}: ${err.error}`);
      }
    } catch (e) {
      alert(`Error launching ${agentId}: ${e.message}`);
    } finally {
      setLaunchingAgent(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'integrations') {
      const interval = setInterval(() => {
        fetchAgents();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const totalFindings = findings.length;
  const criticalFindings = findings.filter(f => f.Severity >= 3).length;
  const functionalBugs = findings.filter(f => f.Type === 'Functional').length;
  const uxIssues = findings.filter(f => f.Type === 'UX' || !f.Type).length;

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(findings, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "he_findings.json");
    a.click();
  };

  // --- KMS CMS Functions ---
  const openKbFile = async (filename) => {
    try {
      const res = await fetch(`/api/kb/${filename}`);
      if (res.ok) {
        const content = await res.text();
        setEditingKbFile({ filename, content, isNew: false });
      }
    } catch (e) {}
  };

  const saveKbFile = async () => {
    if (!editingKbFile?.filename) return;
    try {
      const res = await fetch(`/api/kb/${editingKbFile.filename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingKbFile.content })
      });
      if (res.ok) {
        setEditingKbFile(null);
        fetchKbFiles();
      }
    } catch (e) {}
  };

  const deleteKbFile = async (filename) => {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      const res = await fetch(`/api/kb/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingKbFile?.filename === filename) setEditingKbFile(null);
        fetchKbFiles();
      }
    } catch (e) {}
  };

  const createNewKbFile = () => {
    const name = prompt("Enter new filename (without .md):");
    if (name) {
      setEditingKbFile({ filename: name.endsWith('.md') ? name : name + '.md', content: '# New Rule\n\n...', isNew: true });
    }
  };

  // --- User Story CMS Functions ---
  const saveStory = async () => {
    if (!editingStory.Title || !editingStory.User_Story) return alert('Title and User Story are required');
    try {
      const method = editingStory.isNew ? 'POST' : 'PUT';
      const url = editingStory.isNew ? '/api/stories' : `/api/stories/${editingStory.ID}`;
      
      const payload = {
        Title: editingStory.Title,
        User_Story: editingStory.User_Story,
        Acceptance_Criteria: typeof editingStory.Acceptance_Criteria === 'string' 
          ? editingStory.Acceptance_Criteria.split('\n').filter(c => c.trim())
          : editingStory.Acceptance_Criteria
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingStory(null);
        fetchStories();
      }
    } catch (e) { console.error("Error saving story", e); }
  };

  const deleteStory = async (id) => {
    if (!confirm(`Delete story ${id}?`)) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStories();
    } catch (e) {}
  };

  const toggleStoryActive = async (story) => {
    const newIsActive = story.isActive === false ? true : false;
    try {
      setUserStories(prev => prev.map(s => s.ID === story.ID ? { ...s, isActive: newIsActive } : s));
      const res = await fetch(`/api/stories/${story.ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newIsActive })
      });
      if (!res.ok) fetchStories(); // revert if failed
    } catch (e) {
      console.error("Error toggling story", e);
      fetchStories();
    }
  };

  const toggleAllStories = async (newIsActive) => {
    try {
      setUserStories(prev => prev.map(s => ({ ...s, isActive: newIsActive })));
      await Promise.all(userStories.map(story => 
        fetch(`/api/stories/${story.ID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: newIsActive })
        })
      ));
      fetchStories();
    } catch (e) {
      console.error("Error toggling all stories", e);
      fetchStories();
    }
  };

  const openEditStory = (story) => {
    setEditingStory({
      ...story,
      Acceptance_Criteria: story.Acceptance_Criteria ? story.Acceptance_Criteria.join('\n') : '',
      isNew: false
    });
  };

  const createNewStory = () => {
    setEditingStory({
      Title: '',
      User_Story: '',
      Acceptance_Criteria: '',
      isNew: true
    });
  };

  // --- Renders ---
  // Computed stats from all reports
  const allFindings = reports.flatMap(r => r.findings || []);
  const totalFindings = allFindings.length;
  const uxIssues = allFindings.filter(f => f.Type === 'UX').length;
  const functionalBugs = allFindings.filter(f => f.Type === 'Functional').length;
  const criticalFindings = allFindings.filter(f => f.Severity >= 3).length;

  const renderDashboard = () => (
    <>
      <div className="header">
        <h2>HE Findings Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn glass-panel" onClick={fetchData} style={{ color: 'var(--text-main)' }}>
            <RefreshCw size={18} className={isLoading ? "spin" : ""} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={exportData}>
            <Download size={18} /> Export JSON
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-label">Total Findings</div>
          <div className="stat-value">{totalFindings}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-label">UX Issues</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{uxIssues}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-label">Functional Bugs</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{functionalBugs}</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-label">Critical Issues (Sev 3+)</div>
          <div className={`stat-value ${criticalFindings > 0 ? 'text-danger' : 'text-success'}`}>
            {criticalFindings}
          </div>
        </div>
      </div>

      <div className="stories-layout">
        <div className="stories-list glass-panel" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Evaluation Reports</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem' }}>
            {reports.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <AlertCircle size={32} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No reports yet.</p>
              </div>
            ) : (
              reports.map((r, i) => {
                const isSelected = selectedReportId === r.id;
                return (
                  <div 
                    key={i} 
                    className={`story-list-item ${isSelected ? 'selected' : ''}`}
                    style={{ margin: '0 0.5rem', borderRadius: '8px' }}
                    onClick={() => setSelectedReportId(r.id)}
                  >
                    <div className="story-list-item-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div className="story-id">{r.id}</div>
                      </div>
                      <div className="story-title" style={{ fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>{new URL(r.website).hostname}</div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <div className="story-detail-panel glass-panel" style={{ padding: '0', overflowY: 'auto' }}>
          {selectedReportId ? (() => {
            const report = reports.find(r => r.id === selectedReportId);
            if (!report) return null;
            return (
              <>
                <div className="story-detail-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                  <div>
                    <span className="story-id" style={{ fontSize: '1rem' }}>{report.id}</span>
                    <h3 className="story-title" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{report.website}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <span className="badge badge-primary">{report.findings.length} Findings</span>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  {report.findings.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No findings in this report.</p>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID & Type</th>
                          <th>Severity</th>
                          <th>Issue & Recommendation</th>
                          <th>Context</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.findings.map((f, i) => {
                          let badgeClass = 'badge-primary';
                          if (f.Severity === 2) badgeClass = 'badge-warning';
                          if (f.Severity >= 3) badgeClass = 'badge-danger';
                          if (f.Severity === 0) badgeClass = 'badge-success';
                          
                          const isFunctional = f.Type === 'Functional';
                          return (
                            <tr key={i} style={{ borderLeft: isFunctional ? '4px solid var(--danger)' : '4px solid var(--primary)' }}>
                              <td style={{ verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 600 }}>{f.ID || `HE-${i+1}`}</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: isFunctional ? 'var(--danger)' : 'var(--primary)', fontWeight: 'bold' }}>
                                  {isFunctional ? 'FUNCTIONAL' : 'UX ISSUE'}
                                </div>
                              </td>
                              <td style={{ verticalAlign: 'top' }}>
                                <span className={`badge ${badgeClass}`}>Sev {f.Severity}</span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{f.Issue_Title}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{f.Description}</div>
                                {f.Recommendation && (
                                  <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}><strong>Fix:</strong> {f.Recommendation}</div>
                                )}
                              </td>
                              <td style={{ verticalAlign: 'top' }}>
                                <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>{f.User_Story_Context || 'Global'}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            );
          })() : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
              <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
              <p>Select an evaluation report to view its findings</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderStories = () => (
    <>
      <div className="header">
        <h2>User Stories (CMS)</h2>
        <button className="btn btn-primary" onClick={createNewStory}>
          <Plus size={18} /> New Story
        </button>
      </div>
      
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Manage your user stories here to define the scope of work for the Heuristic Evaluation.
      </p>

      {editingStory ? (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>{editingStory.isNew ? 'Create User Story' : `Editing: ${editingStory.ID}`}</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn glass-panel" onClick={() => setEditingStory(null)}><X size={16}/> Cancel</button>
              <button className="btn btn-primary" onClick={saveStory}><Save size={16}/> Save</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Title</label>
              <input 
                type="text" value={editingStory.Title} 
                onChange={(e) => setEditingStory({...editingStory, Title: e.target.value})}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '0.75rem' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>User Story Description</label>
              <textarea 
                value={editingStory.User_Story} 
                onChange={(e) => setEditingStory({...editingStory, User_Story: e.target.value})}
                style={{ width: '100%', height: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '0.75rem', resize: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Acceptance Criteria (One per line)</label>
              <textarea 
                value={editingStory.Acceptance_Criteria} 
                onChange={(e) => setEditingStory({...editingStory, Acceptance_Criteria: e.target.value})}
                placeholder="- User can click login&#10;- Error message is red"
                style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '0.75rem', resize: 'none' }} 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="stories-layout">
          <div className="stories-list glass-panel" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
               <h3 style={{ fontSize: '1rem', margin: 0 }}>Stories</h3>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--border-color)' }} onClick={() => toggleAllStories(true)}>Check All</button>
                  <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--border-color)' }} onClick={() => toggleAllStories(false)}>Uncheck All</button>
               </div>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem' }}>
              {userStories.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <BookOpen size={32} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No user stories found.</p>
                </div>
              ) : (
                userStories.map((s, i) => {
                  const isActive = s.isActive !== false;
                  const isSelected = selectedStoryId === s.ID;
                  return (
                    <div 
                      key={i} 
                      className={`story-list-item ${isSelected ? 'selected' : ''}`}
                      style={{ margin: '0 0.5rem', borderRadius: '8px' }}
                      onClick={() => setSelectedStoryId(s.ID)}
                    >
                      <div className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isActive} 
                          onChange={() => toggleStoryActive(s)}
                        />
                      </div>
                      <div className="story-list-item-content">
                        <div className="story-id">{s.ID}</div>
                        <div className="story-title" style={{ fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>{s.Title}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="story-detail-panel glass-panel" style={{ padding: '1.5rem' }}>
            {selectedStoryId && userStories.find(s => s.ID === selectedStoryId) ? (() => {
              const s = userStories.find(s => s.ID === selectedStoryId);
              return (
                <>
                  <div className="story-detail-header">
                    <div>
                      <span className="story-id" style={{ fontSize: '1rem' }}>{s.ID}</span>
                      <h3 className="story-title" style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{s.Title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn glass-panel" style={{ padding: '0.5rem' }} onClick={() => openEditStory(s)}>
                        <Edit3 size={16} color="var(--primary)" />
                      </button>
                      <button className="btn glass-panel" style={{ padding: '0.5rem' }} onClick={() => {
                        deleteStory(s.ID);
                        setSelectedStoryId(null);
                      }}>
                        <Trash2 size={16} color="var(--danger)" />
                      </button>
                    </div>
                  </div>
                  <div className="story-desc" style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>{s.User_Story}</div>
                  
                  <div className="story-criteria">
                    <h4>Acceptance Criteria</h4>
                    <ul>
                      {s.Acceptance_Criteria && (Array.isArray(s.Acceptance_Criteria) ? s.Acceptance_Criteria : []).map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </>
              );
            })() : (
              <div style={{ padding: '3rem', textAlign: 'center', margin: 'auto' }}>
                <BookOpen size={48} style={{ opacity: 0.1, margin: '0 auto 1rem', display: 'block' }} />
                <p style={{ color: 'var(--text-muted)' }}>Select a user story to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  const renderCMS = () => (
    <>
      <div className="header">
        <h2>Knowledge Base (CMS)</h2>
        <button className="btn btn-primary" onClick={createNewKbFile}>
          <Plus size={18} /> New Rule
        </button>
      </div>
      
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Manage heuristic rules and guidelines here. <strong>Gemini</strong> will autonomously read these files using Agentic RAG when you ask it to evaluate a UI.
      </p>

      {editingKbFile ? (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '60vh' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Editing: <span style={{ color: 'var(--primary)' }}>{editingKbFile.filename}</span></h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn glass-panel" onClick={() => setEditingKbFile(null)}><X size={16}/> Cancel</button>
              <button className="btn btn-primary" onClick={saveKbFile}><Save size={16}/> Save</button>
            </div>
          </div>
          <textarea 
            value={editingKbFile.content}
            onChange={(e) => setEditingKbFile({...editingKbFile, content: e.target.value})}
            style={{ 
              flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', 
              borderRadius: '8px', color: 'var(--text-main)', padding: '1rem', 
              fontFamily: 'monospace', resize: 'none' 
            }}
          />
        </div>
      ) : (
        <div className="stories-grid">
          {kbFiles.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
              <Database size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
              <p style={{ color: 'var(--text-muted)' }}>No knowledge base files found.</p>
            </div>
          ) : (
            kbFiles.map((file, i) => (
              <div key={i} className="story-card glass-panel" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <BookOpen size={24} color="var(--primary)" />
                  <span style={{ fontWeight: 500 }}>{file}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn glass-panel" style={{ padding: '0.5rem' }} onClick={() => openKbFile(file)}>
                    <Edit3 size={16} color="var(--primary)" />
                  </button>
                  <button className="btn glass-panel" style={{ padding: '0.5rem' }} onClick={() => deleteKbFile(file)}>
                    <Trash2 size={16} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );

  const renderIntegrations = () => (
    <>
      <div className="header">
        <h2>Agent Integrations</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn glass-panel" onClick={resetConnections} style={{ color: 'var(--danger, #ef4444)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={18} /> Reset Connections
          </button>
          <button className="btn glass-panel" onClick={fetchAgents} style={{ color: 'var(--text-main)' }}>
            <RefreshCw size={18} /> Refresh Scan
          </button>
        </div>
      </div>
      
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        HE_SUITE automatically detects supported CLI coding agents installed on your system. 
        Click <strong>Configure</strong> to automatically configure them to use the HE_SUITE MCP Server.
      </p>

      <div className="stories-grid">
        {installedAgents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Terminal size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ color: 'var(--text-muted)' }}>Scanning for agents...</p>
          </div>
        ) : (
          installedAgents.map((agent, i) => (
            <div key={i} className="story-card glass-panel" style={{ flexDirection: 'column', gap: '1rem', border: agent.isInstalled ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border-color)', opacity: agent.isInstalled ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Terminal size={24} color={agent.isInstalled ? "var(--primary)" : "var(--text-muted)"} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem 0' }}>{agent.name}</h3>
                  <span className={`badge ${agent.isInstalled ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                    {agent.isInstalled ? 'Installed' : 'Not Detected'}
                  </span>
                </div>
              </div>
              {agent.isInstalled && (
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  {agent.isConnected ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '8px', padding: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                      {agent.isActive ? (
                        <>
                          <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', marginRight: '0.5rem', boxShadow: '0 0 8px var(--success)', animation: 'pulse 2s infinite' }}></span>
                          Live Connection Active
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} style={{ marginRight: '0.5rem' }} /> Configured
                        </>
                      )}
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => connectAgent(agent.id)}
                      disabled={connectingAgent === agent.id}
                    >
                      {connectingAgent === agent.id ? <RefreshCw size={16} className="spin" /> : <CheckCircle2 size={16} />} 
                      {connectingAgent === agent.id ? 'Configuring...' : 'Configure'}
                    </button>
                  )}
                  <button 
                    className="btn glass-panel" 
                    style={{ flex: 1, justifyContent: 'center', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    onClick={() => launchAgent(agent.id)}
                    disabled={launchingAgent === agent.id}
                  >
                    {launchingAgent === agent.id ? <RefreshCw size={16} className="spin" /> : <Activity size={16} />} 
                    {launchingAgent === agent.id ? 'Launching...' : 'Run / Launch'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

  const renderTerminal = () => {
    if (!activeAgentTerminal) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <TerminalSquare size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h2>Web Terminal</h2>
          <p>Please launch an agent from the Integrations tab to start the terminal.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveTab('integrations')}>
            Go to Integrations
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
        <div className="header" style={{ marginBottom: 0 }}>
          <h2>{activeAgentTerminal.toUpperCase()} Web Terminal</h2>
          <button className="btn glass-panel" onClick={() => setActiveAgentTerminal(null)}>Close Terminal</button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <WebTerminal agentId={activeAgentTerminal} />
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo">
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, var(--primary), #a78bfa)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} color="white" />
          </div>
          <h1>HE SUITE</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: activeTab === 'dashboard' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none' }}
          >
            <Activity size={18} /> Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => setActiveTab('stories')}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: activeTab === 'stories' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none' }}
          >
            <BookOpen size={18} /> User Stories
          </button>
          <button 
            className={`nav-item ${activeTab === 'kb' ? 'active' : ''}`}
            onClick={() => setActiveTab('kb')}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: activeTab === 'kb' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none' }}
          >
            <Database size={18} /> Knowledge Base
          </button>
          <button 
            className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: activeTab === 'integrations' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none' }}
          >
            <Terminal size={18} /> Integrations
          </button>
          <button 
            className={`nav-item ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
            style={{ width: '100%', textAlign: 'left', background: 'transparent', border: activeTab === 'terminal' ? '1px solid rgba(59, 130, 246, 0.3)' : 'none' }}
          >
            <TerminalSquare size={18} /> Web Terminal
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Gemini Agentic RAG Active</strong>
          <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>Gemini reads the Knowledge Base autonomously when evaluating.</p>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'stories' && renderStories()}
        {activeTab === 'kb' && renderCMS()}
        {activeTab === 'integrations' && renderIntegrations()}
        <div style={{ display: activeTab === 'terminal' ? 'block' : 'none', height: '100%' }}>
          {renderTerminal()}
        </div>
      </main>
    </div>
  );
}

export default App;
