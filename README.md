# HE SUITE

HE SUITE is a comprehensive Heuristic Evaluation toolkit built for UI/UX evaluation and reporting. It features a standalone Web Dashboard, persistent Web Terminal integration, and AI-driven automation (like Freebuff CLI).

## Features

- **Web Dashboard**: An interactive, side-by-side view of your Evaluation Reports and detailed findings.
- **Persistent Web Terminal**: A built-in terminal that stays active in the background even if you close the tab, keeping your AI agent (Freebuff) alive with its memory intact.
- **Automated AI Rules**: Built-in rules that prevent the AI from taking destructive actions on your server.
- **Instant Usage**: Completely standalone installation via GitHub.

---

## Installation & Usage

You can install `HE_SUITE` globally on your machine directly from GitHub without cloning the repository!

### 1. Install Globally
Make sure you have Node.js and NPM installed. Then run:
```bash
npm install -g github:agungarifr/HE_SUITE
```

### 2. Start the Application
Once installed, you can launch the HE SUITE Dashboard from anywhere in your terminal:
```bash
he-suite ui
```

This will automatically start the background server and open your default browser to `http://localhost:8888`.

### Additional Commands

- `he-suite mcp`: Start the MCP server manually.
- `he-suite HE <url>`: Run the Heuristic Evaluation Crawler on a specific URL.

---

## Architecture

HE SUITE now operates as a Production-Ready application:
- **UI**: The React dashboard is pre-built and served directly by the `api.js` Express server.
- **Sessions**: The Web Terminal session runs as a background process so you can switch tabs or close the dashboard without losing your agent's context.

*Note: For the Freebuff AI integration to work out of the box in the Web Terminal, make sure `freebuff` is installed globally on your machine.*

---

## Troubleshooting

If you encounter errors during the global installation (`npm install -g`), check these common issues:

### 1. `ENOTDIR: not a directory, rename...`
**Cause:** This happens if you previously used `npm link` on an older version of `he-suite`, leaving a broken symlink in your global `node_modules` folder. NPM tries to overwrite it but fails.
**Solution:** Find and remove the broken symlink or folder manually. For example on macOS/Homebrew:
```bash
rm -rf /opt/homebrew/lib/node_modules/he-suite
# Then run install again:
npm install -g github:agungarifr/HE_SUITE
```

### 2. `spawn sh ENOENT` (Puppeteer Installation Error)
**Cause:** This is a known macOS/NPM bug where NPM fails to find the shell (`sh`) when running `postinstall` scripts (like downloading Chromium for Puppeteer) directly from a GitHub repository installation.
**Solution:** Clear your npm cache and bypass the scripts using `--ignore-scripts`:
```bash
npm cache clean --force
npm install -g github:agungarifr/HE_SUITE --ignore-scripts
```
