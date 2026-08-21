@echo off
echo ==================================================
echo Starting MCP Inspector...
echo This is the official tool to test MCP connections directly.
echo It will open a Web UI where you can click 'List Tools' and 'Call Tool' manually without AI!
echo ==================================================

call npx -y @modelcontextprotocol/inspector node mcp_server.js
