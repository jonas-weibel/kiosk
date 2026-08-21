#!/usr/bin/env bash

cd "$(dirname "$0")" || exit 1

APP="file://$(realpath preview.html)"
PROFILE="$HOME/.config/733-videokiosk-preview"

exec /usr/bin/chromium \
    --user-data-dir="$PROFILE" \
    --no-first-run \
    --no-default-browser-check \
    --disable-pinch \
    --disable-translate \
    --disable-features=Translate,TranslateUI \
    --password-store=basic \
    --autoplay-policy=no-user-gesture-required \
    --allow-file-access-from-files \
    --overscroll-history-navigation=0 \
    "$APP"