#!/bin/bash
set -e

# Forward Docker-internal CDP traffic to Chrome's loopback CDP listener.
# Limit children to avoid resource exhaustion from retries.
socat TCP-LISTEN:9222,bind=0.0.0.0,reuseaddr,fork,max-children=32 TCP:127.0.0.1:9222 &

exec /init
