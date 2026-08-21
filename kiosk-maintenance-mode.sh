#!/usr/bin/env bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
START_SCRIPT="$SCRIPT_DIR/kiosk-start.sh"

# ---------------------------------------------------------
# Nur eine Instanz dieses Skripts gleichzeitig erlauben
# ---------------------------------------------------------

exec 9>/tmp/733-maintenance.lock
flock -n 9 || exit 0


# ---------------------------------------------------------
# Wenn der Kiosk bereits beendet ist: nichts mehr tun
# ---------------------------------------------------------

if ! pgrep -f "/home/kiosk/videokiosk/kiosk-start.sh" >/dev/null \
   && ! pgrep -f "733-videokiosk-chromium" >/dev/null; then
    exit 0
fi


# ---------------------------------------------------------
# Kiosk beenden
# ---------------------------------------------------------

pkill -f "$START_SCRIPT" 2>/dev/null || true
pkill -f "733-videokiosk-chromium" 2>/dev/null || true
pkill -x swaybg 2>/dev/null || true

while pgrep -f "733-videokiosk-chromium" >/dev/null \
   || pgrep -x swaybg >/dev/null; do
    sleep 0.05
done


# ---------------------------------------------------------
# Desktop wiederherstellen
# ---------------------------------------------------------

pcmanfm --desktop-off 2>/dev/null || true

/usr/bin/pcmanfm \
    --desktop \
    >/dev/null 2>&1 9>&- &


# ---------------------------------------------------------
# Panel wiederherstellen
# ---------------------------------------------------------

pkill -x wf-panel-pi 2>/dev/null || true

while pgrep -x wf-panel-pi >/dev/null; do
    sleep 0.05
done

/usr/bin/wf-panel-pi \
    >/dev/null 2>&1 9>&- &