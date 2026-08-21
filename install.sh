#!/bin/bash
echo "Installing HE_SUITE dependencies..."
echo "Please wait, this might take a minute..."

npm install
npm link

echo "Installation complete!"
echo "Closing terminal automatically..."

# Try to close the terminal window gracefully if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e 'tell application "Terminal" to close first window' & exit
else
  exit
fi
