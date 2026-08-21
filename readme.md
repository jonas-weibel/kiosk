# Videokiosk – Offline-Version

Diese Version benötigt weder Python noch einen Webserver, lediglich ein Webbrowser (Firefox, Chrome, Edge) muss installiert sein.

## Start

- Kiosk-Testmodus: `start-preview.bat` starten
- Kiosk-Vollbild: `start-kiosk.bat` starten

## Inhalte ändern

1. Videos (.mp4), Untertitel (-de.srt / -en.srt) und Vorschaubilder (.png) in `/videos` ablegen.
2. Titel und Dateipfade in `config.js` anpassen

## Autostart unter Windows

1. `Win + R`
2. `shell:startup`
3. Verknüpfung zu `start-kiosk.bat` dort ablegen

Im BIOS/UEFI zusätzlich `Power On after AC Loss` oder eine ähnlich benannte Option aktivieren.

## Autostart unter Linux

Wird noch ergänzt...