# Script Runner

Script Runner ist eine webbasierte Anwendung zur Verwaltung, Planung und Ausführung von Python- und Bash-Skripten. Sie bietet eine benutzerfreundliche Oberfläche, um Skripte zu erstellen, zu bearbeiten und auszuführen, sowie Funktionen zur Verwaltung von Anforderungen und Zeitplänen.

## Features

- **Skriptverwaltung**: Erstellung und Bearbeitung von Python- und Bash-Skripten über die Web-Oberfläche.
- **Zeitplanung**: Planen von Skriptausführungen mithilfe von Cron-Ausdrücken.
- **Abhängigkeitsmanagement**: Installation und Verwaltung von Abhängigkeiten für Python-Skripte.
- **Ausführungsprotokolle**: Anzeige von Protokollen und Ausgaben früherer Ausführungen.
- **Organisation**: Tag-basierte Organisation von Skripten.
- **Responsives Design**: Optimiert für Desktop- und Mobilgeräte.

## Systemvoraussetzungen

- **Node.js**: Version 16 oder höher
- **Docker**: Version 20 oder höher (empfohlen)
- **Docker Compose**: Version 1.29 oder höher (empfohlen)

Optional:
- Python 3.8 oder höher (falls Skripte lokal ohne Docker ausgeführt werden sollen).

## Installation

### Mit Docker (empfohlen)

1. **Image aus der GitHub Container Registry (GHCR) ziehen**:
   ```bash
   docker pull ghcr.io/ghotso/script-runner:latest
   ```

2. **Container starten**:
   ```bash
   docker run -d -p 3000:3000 --env-file .env ghcr.io/ghotso/script-runner:latest
   ```

3. **Environment-Datei erstellen**:
   Legen Sie eine `.env`-Datei mit den folgenden Variablen an:
   ```env
   SCRIPTS_PATH=/data/scripts.json
   NEXT_PUBLIC_API_URL=http://your-server-ip:3000
   ```
   Passen Sie die Werte an Ihre Umgebung an.

4. **Zugriff auf die Anwendung**:
   Öffnen Sie einen Browser und navigieren Sie zu `http://localhost:3000`.

### Repository-Installation

1. **Repository klonen**:
   ```bash
   git clone https://github.com/ghotso/script-runner.git
   cd script-runner
   ```

2. **Abhängigkeiten installieren**:
   - Node.js installieren
   - Abhängigkeiten mit npm oder yarn installieren:
     ```bash
     npm install
     ```

3. **Environment-Datei anpassen**:
   Kopieren Sie die Datei `.env.production` und benennen Sie sie in `.env` um. Passen Sie die Konfigurationswerte an (siehe Abschnitt oben).

4. **Datenbank starten** (optional, je nach Konfiguration):
   Stellen Sie sicher, dass eine kompatible Datenbank (z. B. SQLite, PostgreSQL) eingerichtet ist.

5. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

## Beispiele

### Beispiel-Python-Skript
```python
import datetime

def main():
    print(f"Hello, world! The current time is {datetime.datetime.now()}")

if __name__ == "__main__":
    main()
```

### Beispiel-Bash-Skript
```bash
#!/bin/bash
echo "Hello, world!"
date
```

## Beitragen

Wir freuen uns über Beiträge! So können Sie helfen:

1. **Fehler melden**:
   - Öffnen Sie ein Issue auf GitHub.

2. **Code beitragen**:
   - Erstellen Sie einen Fork des Repositories.
   - Nehmen Sie Änderungen vor und senden Sie einen Pull-Request.

## Lizenz

Script Runner wird unter der MIT-Lizenz veröffentlicht. Weitere Informationen finden Sie in der Datei [LICENSE](LICENSE).

## Support

Wenn Sie Hilfe benötigen, erstellen Sie ein Issue auf GitHub oder wenden Sie sich an das Entwicklerteam über die bereitgestellten Kontaktinformationen.

