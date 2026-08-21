#!/usr/bin/env python3

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from datetime import datetime
import json
import csv

PORT = 8765

BASE_DIR = Path(__file__).resolve().parent
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "video-usage.csv"

LOG_DIR.mkdir(exist_ok=True)


def write_log(video_id, language):
    new_file = not LOG_FILE.exists()

    now = datetime.now()

    with LOG_FILE.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter=";")

        if new_file:
            writer.writerow([
                "timestamp",
                "video_id",
                "language"
            ])

        writer.writerow([
            now.isoformat(timespec="minutes"),
            video_id,
            language
        ])


class KioskHandler(SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path != "/log":
            self.send_error(404)
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(length))

            video_id = str(data.get("video_id", "")).strip()
            language = str(data.get("language", "")).strip()

            if not video_id:
                self.send_error(400)
                return

            write_log(video_id, language)

            self.send_response(204)
            self.end_headers()

        except Exception as error:
            print("Logging-Fehler:", error)
            self.send_error(500)


if __name__ == "__main__":
    import os

    os.chdir(BASE_DIR)

    server = ThreadingHTTPServer(
        ("127.0.0.1", PORT),
        KioskHandler
    )

    print(f"Kiosk läuft auf http://127.0.0.1:{PORT}")
    server.serve_forever()