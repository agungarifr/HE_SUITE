#!/bin/bash
echo "Stopping HE_SUITE..."

# Kill all node processes (Sledgehammer approach)
killall -9 node 2>/dev/null

# Clean up specific ports just in case Node spawned child processes that didn't die
lsof -ti:7777 | xargs kill -9 2>/dev/null
lsof -ti:8888 | xargs kill -9 2>/dev/null

# Clean up residual files
rm -f .api_pid .mcp_pid .vite_pid

echo "HE_SUITE successfully stopped."
