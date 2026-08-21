# How to Run a Heuristic Evaluation: A Step-by-Step Guide

This guide will walk you through exactly how to evaluate a website (we'll use `https://test.com` as our example) using HE_SUITE, assuming you are starting from scratch after downloading the repository from GitHub.

We have heavily automated the setup process so you don't need to be tech-savvy to use this!

---

## Step 1: Install Dependencies (Only Needed Once)
Before running the suite for the first time, you need to install the required packages.
- **macOS / Linux**: Double-click `install.sh` in your folder, or run `./install.sh` in the terminal.
- **Windows**: Double-click `install.bat`.
*(The terminal will automatically close when installation is finished).*

---

## Step 2: Start the Suite

Now you can start the application servers. The script will automatically clean up any old disconnected servers to prevent port crashes.
- **macOS / Linux**: Double-click `start.sh` or run `./start.sh` in the terminal.
- **Windows**: Double-click `start.bat`.

---

## Step 3: Use the Web Dashboard & Connect AI

1. Open your web browser and go to **http://localhost:7777**. This is your HE_SUITE Dashboard.
2. Navigate to the **Integrations** tab on the left sidebar.
3. The dashboard will automatically detect installed AI tools (like Freebuff, Cursor, or Gemini).
4. Click **Connect to HE_SUITE** next to your preferred tool. This creates the MCP connection files.
5. Click **Run / Launch** right next to it!
   - This will instantly open the AI tool for you (e.g., spawning a new Terminal running Freebuff, or opening Cursor) with the connection fully registered.

---

## Step 4: Run the Evaluation

Now that your AI is open and connected to the suite, you can let it do the heavy lifting!

1. In your AI tool (like Freebuff terminal), type:
   > "HE_SUITE Help"
2. The AI will read the built-in manual and immediately understand how to use the suite.
3. Next, tell the AI to evaluate a website:
   > "Please run a crawl on https://test.com and evaluate it."
4. The AI will autonomously run the crawler, read the generated screenshot and report, check it against your Knowledge Base rules, and write the bug reports directly to your dashboard!

---

## How to Stop the Suite
When you are done for the day, you should safely turn off the background servers.
- **macOS / Linux**: Run `./stop.sh` in your terminal.
- **Windows**: Double-click the `stop.bat` file in your folder.
