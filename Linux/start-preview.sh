#!/usr/bin/env bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP="file://$(realpath "$SCRIPT_DIR/../Web Application/preview.html")"

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