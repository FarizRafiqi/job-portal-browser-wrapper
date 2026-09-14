#!/usr/bin/with-convenv bash
set -e

# LinuxServer/Selkies Chromium binds DevTools to loopback in current images.
# Forward only on the private Docker network; do not publish port 9222 publicly.
socat TCP-LISTEN:9222,bind=0.0.0.0,reuseaddr,fork TCP:127.0.0.1:9222 &

exec /init
