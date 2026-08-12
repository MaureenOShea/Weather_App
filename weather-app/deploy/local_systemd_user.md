Local systemd user service — enable and run

This guide creates and starts a `systemd --user` service for the app so it runs continuously for your user account.

1. Ensure the unit file exists (created for you):
   `/Users/maureenoshea/.config/systemd/user/weather.service`

2. Reload user units and start the service:

```bash
# Reload user systemd units
systemctl --user daemon-reload

# Enable and start the weather service now and on login
systemctl --user enable --now weather.service

# Check status
systemctl --user status weather.service

# Follow logs
journalctl --user -u weather -f
```

3. If you need to stop or disable:

```bash
systemctl --user stop weather.service
systemctl --user disable weather.service
```

Notes
- The unit uses the venv gunicorn path and project WorkingDirectory. If your project path differs, update the unit file accordingly.
- The service binds to `127.0.0.1:8000`. To expose it on LAN or internet, run a reverse proxy (nginx) or change bind to `0.0.0.0` (not recommended publicly without TLS).
- The unit loads `/path/to/weather-app/.env` — ensure the file exists and includes `OPENWEATHER_API_KEY` and `FLASK_ENV=production`.
- Use `chmod 600 .env` to protect secrets.
