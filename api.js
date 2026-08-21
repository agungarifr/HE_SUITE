import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec, spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import util from 'util';
import os from 'os';

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kbPath = path.join(__dirname, 'public', 'knowledge_base');
const storiesPath = path.join(__dirname, 'public', 'data', 'user_stories.json');

// Initialize directories
async function initDirs() {
  await fs.mkdir(kbPath, { recursive: true }).catch(() => {});
  await fs.mkdir(path.dirname(storiesPath), { recursive: true }).catch(() => {});
}
initDirs();

// Utility for atomic writes to prevent corruption
async function safeWrite(filepath, content) {
  const tmpPath = `${filepath}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, content);
  await fs.rename(tmpPath, filepath);
}

const app = express();
app.use(cors());
app.use(express.json());

// List all markdown files
app.get('/api/kb', async (req, res) => {
  try {
    const files = await fs.readdir(kbPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    res.json(mdFiles);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(kbPath, { recursive: true });
      return res.json([]);
    }
    res.status(500).json({ error: err.message });
  }
});

// Get a specific markdown file content
app.get('/api/kb/:filename', async (req, res) => {
  try {
    const content = await fs.readFile(path.join(kbPath, req.params.filename), 'utf-8');
    res.send(content);
  } catch (err) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Create or Update a markdown file
app.post('/api/kb/:filename', async (req, res) => {
  try {
    const { content } = req.body;
    let filename = req.params.filename;
    if (!filename.endsWith('.md')) filename += '.md';
    
    await safeWrite(path.join(kbPath, filename), content || '');
    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a markdown file
app.delete('/api/kb/:filename', async (req, res) => {
  try {
    await fs.unlink(path.join(kbPath, req.params.filename));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// === User Stories CRUD ===

// Get all stories
app.get('/api/stories', async (req, res) => {
  try {
    const data = await fs.readFile(storiesPath, 'utf-8');
    res.send(data);
  } catch (err) {
    if (err.code === 'ENOENT') return res.json([]);
    res.status(500).json({ error: err.message });
  }
});

// Create a new story
app.post('/api/stories', async (req, res) => {
  try {
    const newStory = req.body;
    if (!newStory.ID) newStory.ID = "US" + Date.now().toString().slice(-4);
    
    let stories = [];
    try {
      const data = await fs.readFile(storiesPath, 'utf-8');
      stories = JSON.parse(data);
    } catch(e) {}
    
    stories.push(newStory);
    await safeWrite(storiesPath, JSON.stringify(stories, null, 2));
    res.json(newStory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a story
app.put('/api/stories/:id', async (req, res) => {
  try {
    const updatedStory = req.body;
    const data = await fs.readFile(storiesPath, 'utf-8');
    let stories = JSON.parse(data);
    
    const index = stories.findIndex(s => s.ID === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    stories[index] = { ...stories[index], ...updatedStory, ID: req.params.id };
    await safeWrite(storiesPath, JSON.stringify(stories, null, 2));
    res.json(stories[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a story
app.delete('/api/stories/:id', async (req, res) => {
  try {
    const data = await fs.readFile(storiesPath, 'utf-8');
    let stories = JSON.parse(data);
    
    stories = stories.filter(s => s.ID !== req.params.id);
    await safeWrite(storiesPath, JSON.stringify(stories, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Agent Integrations ===
const AGENTS = [
  { id: 'antigravity', name: 'Antigravity CLI (agy)', command: 'agy --version' },
  { id: 'freebuff', name: 'Freebuff CLI', command: 'freebuff --version' },
  { id: 'cursor', name: 'Cursor Editor', command: 'cursor --version' },
  { id: 'cline', name: 'Cline / Claude Dev', command: 'code --version' }
];

// Track MCP heartbeats
const activeConnections = {};

app.get('/api/mcp/ping', (req, res) => {
  const agentId = req.query.agent;
  if (agentId) {
    activeConnections[agentId] = Date.now();
  }
  res.send('ok');
});

app.get('/api/agents', async (req, res) => {
  try {
    const results = await Promise.all(AGENTS.map(async (agent) => {
      let isInstalled = false;
      let isConnected = false;
      try {
        await execPromise(agent.command);
        isInstalled = true;
      } catch (e) {
        isInstalled = false;
      }

      // Check if config exists
      try {
        if (agent.id === 'antigravity') {
          await fs.access(path.join(__dirname, '.agents', 'mcp_config.json'));
          isConnected = true;
        } else if (agent.id === 'freebuff') {
          await fs.access(path.join(__dirname, 'mcp.json'));
          isConnected = true;
        } else if (agent.id === 'cursor') {
          await fs.access(path.join(__dirname, '.cursor', 'mcp.json'));
          isConnected = true;
        } else if (agent.id === 'cline') {
          await fs.access(path.join(__dirname, '.cline', 'mcp_settings.json'));
          isConnected = true;
        }
      } catch (e) {
        isConnected = false;
      }
      
      const isActive = activeConnections[agent.id] && (Date.now() - activeConnections[agent.id] < 10000);

      return {
        ...agent,
        isInstalled,
        isConnected,
        isActive
      };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/connect', async (req, res) => {
  try {
    const { agentId } = req.body;
    const serverConfig = {
      mcpServers: {
        "he-suite": {
          command: "node",
          args: ["mcp_server.js", agentId],
          env: {}
        }
      }
    };
    
    const configString = JSON.stringify(serverConfig, null, 2);
    let success = false;
    let configPaths = [];
    
    // Create config path based on agent
    if (agentId === 'antigravity') {
      const p = path.join(__dirname, '.agents', 'mcp_config.json');
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, configString);
      configPaths.push(p);
      success = true;
    } else if (agentId === 'freebuff') {
      // Freebuff config - write to project root standard and attempt user home
      const p1 = path.join(__dirname, 'mcp.json');
      await fs.writeFile(p1, configString);
      configPaths.push(p1);
      
      const homeDir = os.homedir();
      try {
        const p2 = path.join(homeDir, '.freebuff', 'mcp.json');
        await fs.mkdir(path.dirname(p2), { recursive: true });
        await fs.writeFile(p2, configString);
        configPaths.push(p2);
      } catch (e) { /* ignore home dir error if permission denied */ }
      success = true;
    } else if (agentId === 'cursor') {
      const p = path.join(__dirname, '.cursor', 'mcp.json');
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, configString);
      configPaths.push(p);
      success = true;
    } else if (agentId === 'cline') {
      const p = path.join(__dirname, '.cline', 'mcp_settings.json');
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, configString);
      configPaths.push(p);
      success = true;
    }

    if (success) {
      res.json({ success: true, agentId, configPaths });
    } else {
      res.status(400).json({ error: 'Unknown agent ID' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/reset', async (req, res) => {
  try {
    const pathsToClean = [
      path.join(__dirname, '.agents', 'mcp_config.json'),
      path.join(__dirname, 'mcp.json'),
      path.join(os.homedir(), '.freebuff', 'mcp.json'),
      path.join(__dirname, '.cursor', 'mcp.json'),
      path.join(__dirname, '.cline', 'mcp_settings.json')
    ];
    for (const p of pathsToClean) {
      try {
        await fs.unlink(p);
      } catch (e) { /* ignore */ }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/launch', async (req, res) => {
  try {
    const { agentId } = req.body;
    let success = true;

    if (agentId === 'cursor') {
      await execPromise(`cursor "${__dirname}"`);
    } else if (agentId === 'cline') {
      await execPromise(`code "${__dirname}"`);
    } else if (agentId === 'freebuff') {
      if (os.platform() === 'darwin') {
        await execPromise(`osascript -e 'tell application "Terminal" to do script "cd \\"${__dirname}\\" && freebuff"'`);
      } else {
        await execPromise(`start cmd /k "cd /d \\"${__dirname}\\" && freebuff"`);
      }
    } else if (agentId === 'antigravity') {
      if (os.platform() === 'darwin') {
        await execPromise(`osascript -e 'tell application "Terminal" to do script "cd \\"${__dirname}\\" && agy"'`);
      } else {
        await execPromise(`start cmd /k "cd /d \\"${__dirname}\\" && agy"`);
      }
    } else {
      success = false;
      return res.status(400).json({ error: 'Launch not supported for this agent yet.' });
    }
    
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 8888;
const server = app.listen(PORT, () => {
  console.log(`Knowledge Base CMS API running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });

const agentProcesses = {};
const agentHistories = {};
const activeWebSockets = new Set();

wss.on('connection', (ws) => {
  activeWebSockets.add(ws);
  ws.attachedAgent = null;

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      
      if (data.type === 'start') {
        const agentId = data.agentId;
        ws.attachedAgent = agentId;
        
        if (!agentHistories[agentId]) agentHistories[agentId] = "";

        if (agentProcesses[agentId]) {
          // Reattach to existing process
          ws.send(JSON.stringify({ type: 'output', data: agentHistories[agentId] }));
          ws.send(JSON.stringify({ type: 'output', data: `\r\n\x1b[33m[Reattached to running ${agentId} session]\x1b[0m\r\n` }));
        } else {
          // Spawn new process
          const cmd = agentId === 'freebuff' ? 'freebuff' : 'agy';
          const p = spawn(cmd, [], {
            cwd: __dirname,
            shell: true,
            env: { ...process.env, FORCE_COLOR: '1' }
          });
          agentProcesses[agentId] = p;

          const broadcast = (str) => {
            agentHistories[agentId] += str;
            if (agentHistories[agentId].length > 50000) {
              agentHistories[agentId] = agentHistories[agentId].slice(-50000);
            }
            for (const client of activeWebSockets) {
              if (client.readyState === 1 /* OPEN */ && client.attachedAgent === agentId) {
                client.send(JSON.stringify({ type: 'output', data: str }));
              }
            }
          };

          p.stdout.on('data', (d) => broadcast(d.toString()));
          p.stderr.on('data', (d) => broadcast(d.toString()));

          p.on('close', (code) => {
            broadcast(`\r\n\x1b[31m[Process exited with code ${code}]\x1b[0m\r\n`);
            delete agentProcesses[agentId];
          });
        }
      } else if (data.type === 'input') {
        const agentId = ws.attachedAgent;
        if (agentId && agentProcesses[agentId] && agentProcesses[agentId].stdin) {
          agentProcesses[agentId].stdin.write(data.input);
        }
      }
    } catch (e) {
      console.error("WS Error:", e);
    }
  });

  ws.on('close', () => {
    activeWebSockets.delete(ws);
    // Process keeps running in the background!
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`\n[🚨 ERROR] Port ${PORT} is already in use!`);
    console.error(`This happens because a previous server was suspended (Ctrl+Z) instead of stopped (Ctrl+C).`);
    console.error(`Please run 'killall -9 node' in your terminal to force quit the zombie servers, then try again.\n`);
    process.exit(1);
  } else {
    console.error('[🚨 ERROR]', e);
    process.exit(1);
  }
});
