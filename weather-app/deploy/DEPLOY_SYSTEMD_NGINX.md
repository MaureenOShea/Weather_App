Systemd + nginx deployment guide (concise)

Overview
- This guide shows steps to deploy the Flask app on a Linux VPS using a Python virtualenv, Gunicorn (systemd service), and nginx as a reverse proxy.

Assumptions
- You have a VPS (Ubuntu/Debian recommended)
- You have SSH access and sudo privileges
- Your repo is on the server at `/path/to/weather-app` (replace all occurrences)
- `EnvironmentFile` in the service points to `/path/to/weather-app/.env` (create this file with `OPENWEATHER_API_KEY=...` and `FLASK_ENV=production`)

1) Install prerequisites (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx git
```

2) Clone or copy your project to the server

```bash
# on the server
cd /srv
git clone <your-repo-url> weather-app
cd weather-app
```

3) Create & activate virtualenv, install deps

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

4) Create `.env` with production secrets (do NOT commit to git)

```
OPENWEATHER_API_KEY=your_real_api_key
FLASK_ENV=production
SECRET_KEY=change-this-to-a-random-string
```

5) Copy the systemd unit file and nginx config to the appropriate locations

```bash
# Copy service file
sudo cp deploy/weather.service /etc/systemd/system/weather.service
# Edit the file to replace /path/to/weather-app and username
sudo nano /etc/systemd/system/weather.service

# Copy nginx config
sudo cp deploy/nginx_weather.conf /etc/nginx/sites-available/weather
# Edit the file to set server_name and static alias
sudo ln -s /etc/nginx/sites-available/weather /etc/nginx/sites-enabled/
```

6) Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable weather
sudo systemctl start weather
sudo systemctl status weather
```

7) Test and configure nginx

```bash
# Test nginx config and reload
sudo nginx -t
sudo systemctl reload nginx
```

8) Enable HTTPS (Let's Encrypt / Certbot)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

9) Logs and troubleshooting

```bash
# Follow journal logs for the service
sudo journalctl -u weather -f

# nginx error logs
sudo tail -f /var/log/nginx/error.log
```

Notes & security
- Make sure `/path/to/weather-app/.env` is readable by the service user only (`chmod 600 .env`).
- Use a non-root user for `User=` in the systemd unit (e.g., `ubuntu`, `debian`, `youruser`).
- Consider using a process manager like Supervisor or scaling via containers if traffic grows.

That's it — the app should now be reachable at `http://example.com` (replace domain) with nginx handling TLS.
