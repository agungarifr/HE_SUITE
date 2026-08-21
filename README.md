# HE SUITE

HE SUITE is a comprehensive Heuristic Evaluation toolkit built for UI/UX evaluation and reporting. It features a standalone Web Dashboard, persistent Web Terminal integration, and AI-driven automation (like Freebuff CLI).

## Features

- **Web Dashboard**: An interactive, side-by-side view of your Evaluation Reports and detailed findings.
- **Persistent Web Terminal**: A built-in terminal that stays active in the background even if you close the tab, keeping your AI agent (Freebuff) alive with its memory intact.
- **Automated AI Rules**: Built-in rules that prevent the AI from taking destructive actions on your server.
- **Instant Usage**: Completely standalone installation via GitHub.

---

## Step-by-Step Installation (Beginner-Friendly Guide)

If you are new to terminal commands, follow these step-by-step instructions carefully to get HE SUITE running on your computer.

### Step 1: Install Prerequisites

Before you can use HE SUITE, your computer needs **Node.js** and **Git**.

**For macOS Users:**
1. Open your **Terminal** app.
2. Install **Homebrew** (a package manager) by pasting this command and pressing Enter:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Install Node.js and Git by running:
   ```bash
   brew install node git
   ```

**For Windows Users:**
1. Download and install **Node.js** from [nodejs.org](https://nodejs.org/). (Choose the LTS version and keep clicking 'Next' during installation).
2. Download and install **Git** from [git-scm.com](https://git-scm.com/).
3. Once installed, open the **Git Bash** app (search for it in your Windows Start menu). You will run all commands below inside Git Bash.

---

### Step 2: Download & Install HE SUITE

The most stable way to install HE SUITE is to download the files locally to your computer first.

1. In your Terminal (or Git Bash), download the project by running:
   ```bash
   git clone https://github.com/agungarifr/HE_SUITE.git
   ```
2. Enter the folder you just downloaded:
   ```bash
   cd HE_SUITE
   ```
3. Install the application globally to your system:
   ```bash
   npm install -g .
   ```
   *(Note: This might take a few minutes as it downloads necessary components like Chromium for the crawler).*

---

### Step 3: Run HE SUITE

Once the installation is completely finished, you can run the application from **anywhere** on your computer.

1. Type the following command and press Enter:
   ```bash
   he-suite ui
   ```
2. The internal server will start, and your default web browser will automatically open the Dashboard at `http://localhost:8888`.

You are now ready to use HE SUITE!

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
