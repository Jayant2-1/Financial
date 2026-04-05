#!/usr/bin/env sh
set -eu

if [ -z "${NODE_ENV:-}" ]; then
  export NODE_ENV=production
fi

if [ -z "${PORT:-}" ]; then
  export PORT=4000
fi

echo "Starting finance backend on port ${PORT} (NODE_ENV=${NODE_ENV})"
exec node src/server.js
