@echo off
setlocal
cd /d "%~dp0"

set "APP=file:///%CD:\=/%/preview.html"

rem Feste, separate Profile für den Videokiosk.
rem Die Ordner werden wiederverwendet und nicht bei jedem Start neu angelegt.
set "CHROME_PROFILE=%LOCALAPPDATA%\733-videokiosk-chrome"
set "EDGE_PROFILE=%LOCALAPPDATA%\733-videokiosk-edge"

set "CHROME64=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME64%" (
  start "" "%CHROME64%" ^
    --user-data-dir="%CHROME_PROFILE%" ^
    --no-first-run ^
    --no-default-browser-check ^
    --disable-pinch ^
    --autoplay-policy=no-user-gesture-required ^
    --allow-file-access-from-files ^
    "%APP%"
  exit /b
)

set "CHROME32=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME32%" (
  start "" "%CHROME32%" ^
    --user-data-dir="%CHROME_PROFILE%" ^
    --no-first-run ^
    --no-default-browser-check ^
    --disable-pinch ^
    --autoplay-policy=no-user-gesture-required ^
    --allow-file-access-from-files ^
    "%APP%"
  exit /b
)

set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  start "" "%EDGE%" ^
    --user-data-dir="%EDGE_PROFILE%" ^
    --edge-kiosk-type=fullscreen ^
    --no-first-run ^
    --no-default-browser-check ^
    --disable-pinch ^
    --autoplay-policy=no-user-gesture-required ^
    --allow-file-access-from-files ^
    "%APP%"
  exit /b
)

set "EDGE64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE64%" (
  start "" "%EDGE64%" ^
    --user-data-dir="%EDGE_PROFILE%" ^
    --edge-kiosk-type=fullscreen ^
    --no-first-run ^
    --no-default-browser-check ^
    --disable-pinch ^
    --autoplay-policy=no-user-gesture-required ^
    --allow-file-access-from-files ^
    "%APP%"
  exit /b
)

echo Edge oder Chrome wurde nicht gefunden.
pause