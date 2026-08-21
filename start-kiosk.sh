#!/usr/bin/env bash

#!/usr/bin/env bash

cd "$(dirname "$0")" || exit 1

APP="file://$(realpath index.html)"
PROFILE="$HOME/.config/733-videokiosk-chromium"

# ---------------------------------------------------------
# Kiosk-Oberfläche vorbereiten
# ---------------------------------------------------------

# Desktop-Icons und Desktop-Menü deaktivieren.
pcmanfm --desktop-off 2>/dev/null || true

# Raspberry-Pi-Panel ausblenden.
pkill -x wf-panel-pi 2>/dev/null || true

# Schwarzen Hintergrund anzeigen.
pkill -x swaybg 2>/dev/null || true
swaybg -c '#000000' >/dev/null 2>&1 &

# ---------------------------------------------------------
# Chromium-Kiosk
# ---------------------------------------------------------

while true
do
    /usr/bin/chromium \
        --user-data-dir="$PROFILE" \
        --kiosk \
        --no-first-run \
        --no-default-browser-check \
        --noerrdialogs \
        --disable-session-crashed-bubble \
        --disable-pinch \
        --disable-translate \
        --disable-features=Translate,TranslateUI \
        --password-store=basic \
        --autoplay-policy=no-user-gesture-required \
        --allow-file-access-from-files \
        --overscroll-history-navigation=0 \
        "$APP"

    sleep 2
done