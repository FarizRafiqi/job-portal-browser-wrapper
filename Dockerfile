FROM lscr.io/linuxserver/chromium:latest
USER root
RUN apt-get update && apt-get install -y --no-install-recommends nodejs npm && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/job-worker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY worker.cjs browser.cjs start-worker.cjs ./
COPY autostart_wayland /defaults/autostart_wayland
COPY entrypoint.sh /usr/local/bin/job-portal-entrypoint.sh
RUN chmod 0755 /defaults/autostart_wayland /usr/local/bin/job-portal-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/job-portal-entrypoint.sh"]
