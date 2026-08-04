# Videokiosk – Offline-Version

Diese Version benötigt weder Python noch einen Webserver.

## Start

- Test: `index.html` doppelklicken
- Kiosk-Vollbild: `start-kiosk.bat` starten

## Inhalte ändern

1. MP4-Dateien nach `videos`
2. Vorschaubilder nach `thumbnails`
4. Titel und Dateipfade in `config.js` anpassen

Bei eingebrannten Untertiteln einfach:

```js
subtitles: {}
```

## Idle-Modus

`idleTimeoutSeconds` legt fest, nach wie vielen Sekunden die automatische Wiedergabe startet.
Die Videos werden pro Durchlauf zufällig gemischt und jeweils einmal abgespielt.
Eine Berührung beendet den Idle-Modus.

## Autostart unter Windows

1. `Win + R`
2. `shell:startup`
3. Verknüpfung zu `start-kiosk.bat` dort ablegen

Im BIOS/UEFI zusätzlich `Power On after AC Loss` oder eine ähnlich benannte Option aktivieren.
