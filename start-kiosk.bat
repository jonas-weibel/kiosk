@echo off
setlocal
cd /d "%~dp0"
set "APP=file:///%CD:\=/%/index.html"

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk "%APP%" --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --autoplay-policy=no-user-gesture-required
  exit /b
)

set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE64%" (
  start "" "%EDGE64%" --kiosk "%APP%" --edge-kiosk-type=fullscreen --no-first-run --disable-pinch --autoplay-policy=no-user-gesture-required
  exit /b
)

set "CHROME64=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME64%" (
  start "" "%CHROME64%" --kiosk "%APP%" --no-first-run --disable-pinch --autoplay-policy=no-user-gesture-required
  exit /b
)

set "CHROME32=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME32%" (
  start "" "%CHROME32%" --kiosk "%APP%" --no-first-run --disable-pinch --autoplay-policy=no-user-gesture-required
  exit /b
)

echo Edge oder Chrome wurde nicht gefunden.
pause