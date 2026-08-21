#!/usr/bin/env bash

# Kiosk-Neustartschleife zuerst beenden.
pkill -f "/home/kiosk/videokiosk/start-kiosk.sh" 2>/dev/null || true

# Nur Chromium mit dem Kiosk-Profil beenden.
pkill -f "733-videokiosk-chromium" 2>/dev/null || true

# Schwarzen Hintergrund entfernen.
pkill -x swaybg 2>/dev/null || true

sleep 1

# Desktop wieder aktivieren.
pcmanfm --desktop >/dev/null 2>&1 &

# Raspberry-Pi-Panel wieder starten.
if ! pgrep -x wf-panel-pi >/dev/null; then
    wf-panel-pi >/dev/null 2>&1 &
fi