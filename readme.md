# Videokiosk – Offline-Version

Diese Version des Videokiosks läuft vollständig lokal und benötigt keinen Webserver.

Alle Videos, Vorschaubilder, Untertitel, Schriftarten und sonstigen Dateien werden direkt aus dem Projektordner geladen.

Für den Betrieb wird lediglich ein kompatibler Webbrowser benötigt. Unter Windows verwenden die mitgelieferten Startskripte bevorzugt Google Chrome. Unter Raspberry Pi / Linux wird Chromium verwendet.

## Projektstruktur
1. Video-IDs und Metainformationen in `config.js` anpassen
2. Videos (.mp4), Untertitel (-de.srt / -en.srt) und Vorschaubilder (.png) in `/videos` ablegen.

# Start unter Linux / Raspberry Pi
- Kiosk-Testmodus: `start-preview.sh` starten
- Kiosk-Vollbild: `start-kiosk.sh` starten

Für Autostart-Konfiguration des Raspberry Pi, siehe separate Readme-Datei

# Start unter Windows
- Kiosk-Testmodus: `start-preview.bat` starten
- Kiosk-Vollbild: `start-kiosk.bat` starten

Für Autostart die bat-Datei in den Autostart-Ordner legen und automatische Anmeldung & restart after power loss aktivieren.