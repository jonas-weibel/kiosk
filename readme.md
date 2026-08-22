# Videokiosk – Offline-Version / Raspberry Pi 
Diese Version des Videokiosks läuft vollständig lokal auf einem Raspberry Pi / Linux mit Chromium. Alle Videos, Vorschaubilder, Untertitel, Schriftarten und sonstigen Dateien werden direkt aus dem Projektordner geladen.

## Wartung/Zugriff

### Kiosk-Modus beenden (Variante 1):
Desktop aufrufen	    -> 	`Strg + Alt + K`

### Kiosk-Modus beenden (Variante 2):
- Terminal aufrufen	    -> 	`Strg + Alt + T`
- Restart-Loop stoppen	->	`pkill -f start-kiosk.sh`
- Chromium stoppen	    ->	`pkill chromium`

### Fernzugriff:
Sofern der Raspberry Pi mit dem Internet verbunden ist, kann über [Raspberry Pi Connect(https://connect.raspberrypi.com)] auf die Oberfläche zugegriffen werden.

### Dateiübertragung
Möglich über kostenlose Dienstleister wie z.B. [Wormhole(https://wormhole.app)] wormhole.app

## Projektstruktur
1. Video-IDs und Metainformationen in `app/config.js` pflegen. 
    - Die Video-ID sollte aus `[Person][fortlaufende Nummer]` bestehen, Beispiel: `oshrit-01`, `oshrit-02`.
2. Videodateien unter  'app/videos/ ablegen 
    - Videos:       `[video-id].mp4`,         Beispiel: `oshrit-01.mp4`
    - Untertitel:   `[video-id]-[de/en].srt`, Beispiel: `oshrit-01-de.srt`
    - Vorschaubild  `[person].png`,           Beispiel: `oshrit.png`