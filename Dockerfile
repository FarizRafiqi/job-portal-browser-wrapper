FROM lscr.io/linuxserver/chromium:latest

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends socat \
    && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /usr/local/bin/job-portal-entrypoint.sh
RUN chmod 0755 /usr/local/bin/job-portal-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/job-portal-entrypoint.sh"]
