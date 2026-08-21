#!/usr/bin/env bash

cd "$(dirname "$0")" || exit 1

APP="file://$(realpath index.html)"
PROFILE="$HOME/.config/733-videokiosk-chromium"

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
        --autoplay-policy=no-user-gesture-required \
        --allow-file-access-from-files \
        --overscroll-history-navigation=0 \
        "$APP"

    sleep 2
done