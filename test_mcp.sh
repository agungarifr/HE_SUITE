#!/bin/bash
echo "=================================================="
echo "Starting MCP Inspector..."
echo "This is the official tool to test MCP connections directly."
echo "It will open a Web UI where you can click 'List Tools' and 'Call Tool' manually without AI!"
echo "=================================================="

npx -y @modelcontextprotocol/inspector node mcp_server.js
