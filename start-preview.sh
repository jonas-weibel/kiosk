#!/usr/bin/env bash

cd "$(dirname "$0")" || exit 1

APP="file://$(realpath preview.html)"
PROFILE="$HOME/.config/733-videokiosk-preview"

exec /usr/bin/chromium \
    --user-data-dir="$PROFILE" \
    --start-fullscreen \
    --no-first-run \
    --no-default-browser-check \
    --disable-pinch \
    --autoplay-policy=no-user-gesture-required \
    --allow-file-access-from-files \
    "$APP"