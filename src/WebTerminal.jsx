import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function WebTerminal({ agentId }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const wsRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#ffffff',
        foreground: '#1e293b',
        cursor: '#3b82f6',
        black: '#000000',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#8b5cf6',
        cyan: '#06b6d4',
        white: '#ffffff',
      },
      fontFamily: 'monospace',
      fontSize: 14,
    });
    
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.writeln(`\x1b[36mConnecting to backend terminal for ${agentId}...\x1b[0m`);

    // Connect WebSocket
    const ws = new WebSocket(`ws://${window.location.hostname}:8888`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'start', agentId }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'output') {
          term.write(payload.data);
        }
      } catch (e) {
        console.error('Terminal WS message error', e);
      }
    };

    ws.onclose = () => {
      term.writeln('\r\n\x1b[31m[WebSocket Disconnected]\x1b[0m');
    };

    // Handle user input
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'input', input: data }));
      }
    });

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      term.dispose();
    };
  }, [agentId]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', padding: '1rem', background: '#ffffff', borderRadius: '12px' }}>
      <div ref={terminalRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}
