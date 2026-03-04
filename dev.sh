#!/bin/bash

# Orchid & Plum - Start backend and storefront together
# Usage: ./dev.sh
# Automatically finds free ports if defaults (9000/8000) are occupied.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if a port is in use. Returns 0 if occupied, 1 if free.
is_port_busy() {
  lsof -iTCP:"$1" -sTCP:LISTEN -t &>/dev/null
}

# Find a free port starting from the given port.
find_free_port() {
  local port=$1
  local max=$((port + 20))
  while is_port_busy "$port"; do
    echo "  Port $port is busy, trying $((port + 1))..." >&2
    port=$((port + 1))
    if [ "$port" -ge "$max" ]; then
      echo "  Error: no free port found in range $1-$max" >&2
      exit 1
    fi
  done
  echo "$port"
}

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $STOREFRONT_PID 2>/dev/null
  wait $BACKEND_PID $STOREFRONT_PID 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Find available ports
BACKEND_PORT=$(find_free_port 9000)
STOREFRONT_PORT=$(find_free_port 8000)

# Start backend (Medusa)
echo "Starting backend on http://localhost:$BACKEND_PORT ..."
cd "$ROOT_DIR/orchid-plum" && npx medusa develop -p "$BACKEND_PORT" &
BACKEND_PID=$!

# Start storefront (Next.js)
echo "Starting storefront on http://localhost:$STOREFRONT_PORT ..."
cd "$ROOT_DIR/orchid-plum-storefront" && npx next dev --turbopack -p "$STOREFRONT_PORT" &
STOREFRONT_PID=$!

echo ""
echo "Backend:    http://localhost:$BACKEND_PORT"
echo "Admin:      http://localhost:$BACKEND_PORT/app"
echo "Storefront: http://localhost:$STOREFRONT_PORT"
echo ""
echo "Press Ctrl+C to stop both."

wait
