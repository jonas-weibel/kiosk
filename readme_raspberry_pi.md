# Videokiosk – Raspberry-Pi-Konfiguration

## 1. Raspberry Pi OS installieren

Mit dem Raspberry Pi Imager installieren:

- Raspberry Pi OS 64-bit mit Desktop
- Benutzername festlegen, z. B. `kiosk`
- WLAN konfigurieren, falls benötigt
- SSH aktivieren

Nach dem ersten Start:

```bash
sudo apt update
sudo apt full-upgrade -y
sudo reboot
```

## 2. Autologin und Bildschirm konfigurieren

```bash
sudo raspi-config
```

Dort einstellen:

- Boot direkt zum Desktop
- Desktop Auto Login aktivieren
- Screen Blanking deaktivieren
- SSH aktivieren

Der Pi soll nach dem Einschalten ohne Eingabe direkt bis zum Desktop starten.

## 3. Projekt ablegen

Empfohlen:

```text
/home/kiosk/videokiosk/
```

Zum Beispiel über Git:

```bash
cd ~
git clone REPOSITORY-URL videokiosk
```

Die MP4-Dateien separat in

```text
~/videokiosk/videos/
```

kopieren.

## 4. Kiosk-Startskript

`start-kiosk.sh` im Projektordner:

```bash
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
```

Ausführbar machen:

```bash
chmod +x ~/videokiosk/start-kiosk.sh
```

Testen:

```bash
~/videokiosk/start-kiosk.sh
```

## 5. Kiosk automatisch starten

Autostart-Datei anlegen bzw. öffnen:

```bash
mkdir -p ~/.config/labwc
nano ~/.config/labwc/autostart
```

Folgende Zeile ergänzen:

```bash
/home/kiosk/videokiosk/start-kiosk.sh &
```

Falls der Benutzer nicht `kiosk` heißt, den Pfad entsprechend anpassen.

Danach:

```bash
sudo reboot
```

Nach dem Neustart sollte Chromium automatisch im Kioskmodus starten.

## 6. Display und Touchscreen

Bei Hochkantbetrieb das Display in Raspberry Pi OS auf 90° bzw. 270° drehen.

Danach prüfen:

- Bild korrekt gedreht
- Touchkoordinaten korrekt
- vertikales Scrollen funktioniert
- Pinch-Zoom funktioniert nicht

## 7. Dauerbetrieb prüfen

- Pi startet nach Stromzufuhr automatisch
- Desktop-Autologin funktioniert
- Bildschirm bleibt dauerhaft eingeschaltet
- Chromium startet automatisch
- Videos starten ohne Benutzereingabe
- Kiosk funktioniert ohne Internet
- Chromium startet nach einem Absturz erneut
- SSH funktioniert für Fernwartung

## Wartung

Per SSH:

```bash
ssh kiosk@733-kiosk.local
```

Projekt aktualisieren:

```bash
cd ~/videokiosk
git pull
sudo reboot
```
