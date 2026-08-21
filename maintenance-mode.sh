#!/usr/bin/env bash

# Kiosk-Neustartschleife stoppen
pkill -f "/home/kiosk/videokiosk/start-kiosk.sh" 2>/dev/null || true

# Kiosk-Chromium beenden
pkill -f "733-videokiosk-chromium" 2>/dev/null || true

# Schwarzen Hintergrund entfernen
pkill -x swaybg 2>/dev/null || true

while pgrep -f "733-videokiosk-chromium" >/dev/null \
   || pgrep -x swaybg >/dev/null; do
    sleep 0.1
done

# Normalen Desktop wiederherstellen
pcmanfm --desktop-off 2>/dev/null || true

while pgrep -x pcmanfm >/dev/null; do
    sleep 0.1
done

/usr/bin/pcmanfm --desktop >/dev/null 2>&1 &


# Panel wiederherstellen
pkill -x wf-panel-pi 2>/dev/null || true

while pgrep -x wf-panel-pi >/dev/null; do
    sleep 0.1
done

/usr/bin/wf-panel-pi >/dev/null 2>&1 &