# OPUS DB auto-refresh

The OPUS website packages `data/opus/opusdata.db` into the Docker image at
build time. The daily auto-refresh script updates a candidate copy of that DB,
compares the updated corpus list with the current one, and only rebuilds the app
when corpora were added or removed.

Run it manually from the repository root with:

```sh
make auto-refresh
```

The script writes logs to `logs/opus-auto-refresh.log` by default and uses
`flock` to avoid overlapping runs.

## systemd timer

Install the following as `/etc/systemd/system/opus-web-auto-refresh.service`:

```ini
[Unit]
Description=Refresh OPUS website DB and rebuild on corpus-list changes

[Service]
Type=oneshot
WorkingDirectory=/home/lukas/OPUS-website-UI
ExecStart=/home/lukas/OPUS-website-UI/bin/auto-refresh-opus-db.sh
```

Install the following as `/etc/systemd/system/opus-web-auto-refresh.timer`:

```ini
[Unit]
Description=Run OPUS website DB auto-refresh daily

[Timer]
OnCalendar=daily
RandomizedDelaySec=30min
Persistent=true

[Install]
WantedBy=timers.target
```

Enable it with:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now opus-web-auto-refresh.timer
```

Check status and logs with:

```sh
systemctl status opus-web-auto-refresh.timer
journalctl -u opus-web-auto-refresh.service
```

## cron alternative

If systemd timers are not available, run it daily from cron:

```cron
17 3 * * * /home/lukas/OPUS-website-UI/bin/auto-refresh-opus-db.sh
```
