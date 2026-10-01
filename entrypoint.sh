#!/bin/bash
set -e
# Worker connects to real loopback CDP; no raw CDP forwarding.
node /opt/job-worker/start-worker.cjs &
exec /init
