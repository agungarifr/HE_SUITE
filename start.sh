#!/bin/bash
echo "Starting HE_SUITE..."

# Kill any existing node processes to prevent port conflicts (EADDRINUSE)
echo "Cleaning up any old background services..."
killall -9 node 2>/dev/null
lsof -ti:7777 | xargs kill -9 2>/dev/null
lsof -ti:8888 | xargs kill -9 2>/dev/null

echo "=================================================="
echo "All services are starting in the background!"
echo "Wait about 3 seconds, then access the web app at http://localhost:7777"
echo "To safely stop the servers later, run ./stop.sh"
echo "=================================================="

# Run concurrently in the background and detach
nohup npm run dev > .he_suite.log 2>&1 &
