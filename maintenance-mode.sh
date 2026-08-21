#!/usr/bin/env bash

# Kiosk-Neustartschleife stoppen
pkill -f "/home/kiosk/videokiosk/start-kiosk.sh" 2>/dev/null || true

# Kiosk-Chromium beenden
pkill -f "733-videokiosk-chromium" 2>/dev/null || true

# Schwarzen Hintergrund entfernen
pkill -x swaybg 2>/dev/null || true

sleep 1

# Normalen Desktop wiederherstellen
/usr/bin/pcmanfm --desktop >/dev/null 2>&1 &


# Panel wiederherstellen
/usr/bin/wf-panel-pi >/dev/null 2>&1 &

# Destkop 