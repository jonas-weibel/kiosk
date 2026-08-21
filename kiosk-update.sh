#!/usr/bin/env bash

cd /home/kiosk/videokiosk || exit 1

echo "Kiosk wird auf den aktuellen Stand von github.com/jonas-weibel/kiosk aktualisiert..."
echo

git fetch origin
git reset --hard origin/main

echo
echo "Aktueller Stand:"
git log -1 --format="%h  %cd  %s" --date=format:"%d.%m.%Y %H:%M"
read -p "Enter zum Schließen..."
