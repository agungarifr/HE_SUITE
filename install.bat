@echo off
echo Installing HE_SUITE dependencies...
echo Please wait, this might take a minute...

call npm install
call npm link

echo Installation complete!
echo Closing terminal automatically...
exit
