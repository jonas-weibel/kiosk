# Videokiosk – Offline-Version / Raspberry Pi 
Diese Version des Videokiosks läuft vollständig lokal auf einem Raspberry Pi / Linux mit Chromium. Alle Videos, Vorschaubilder, Untertitel, Schriftarten und sonstigen Dateien werden direkt aus dem Projektordner geladen.

## Projektstruktur
1. Video-IDs und Metainformationen in 'app/config.js' pflegen
    a. Video-ID sollte aus Person + fortlaufender Nummer bestehen, z.b. 'oshrit-01', 'oshrit-02', etc
    b. Meta-Informationen werden unter dem Videotitel angezeigt, typischerweise Interviewpartner und -Ort / Datum
2. Dateien unter  'app/videos/ ablegen 
    a. Videos:          [video-id].mp4,             Beispiel: oshrit-01.mp4
    b. Untertitel:      [video-id]-[de/en].srt      Beispiel: oshrit-01-de.srt
    c. Vorschaubilder   [person].png                Beispiel: oshrit.png
       Vorschaubilder werden nur pro Person abgelegt und automatisch auf alle zugehörigen Videos angewendet.


# Wartung/Zugriff
## Kiosk-Modus beenden (Variante 1):
Desktop aufrufen	    -> 	Strg + Alt + K

## Kiosk-Modus beenden (Variante 2):
Terminal aufrufen	    -> 	Strg + Alt + T
Restart-Loop stoppen	->	pkill -f start-kiosk.sh
Chromium stoppen	    ->	pkill chromium

## Fernzugriff:
Sofern der Raspberry Pi mit dem Internet verbunden ist, kann über connect.raspberrypi.com auf die Oberfläche zugegriffen werden.

## Dateiübertragung
Möglich über kostenlose Dienstleister wie z.B. wormhole.app