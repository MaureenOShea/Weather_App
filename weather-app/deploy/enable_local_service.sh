#!/usr/bin/env bash
# Helper: reload, enable, and start the user service
set -euo pipefail

echo "Reloading systemd user units..."
systemctl --user daemon-reload

echo "Enabling and starting weather.service..."
systemctl --user enable --now weather.service

echo "Service status:"
systemctl --user status weather.service --no-pager

echo "To follow logs: journalctl --user -u weather -f"
