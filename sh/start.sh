#!/usr/bin/env bash

# Start a simple static server and open the main page in the default browser.
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
TARGET_PORT="${PORT:-80}"
FALLBACK_PORT="${FALLBACK_PORT:-8080}"
SERVER_PID=""
LOG_FILE="$(mktemp -t imagineers-http.log.XXXXXX)"

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$LOG_FILE"
}
trap cleanup EXIT INT TERM

require_python() {
  if ! command -v python3 >/dev/null 2>&1; then
    printf 'python3 is required to serve the site. Please install it first.\n' >&2
    exit 1
  fi
}

start_server() {
  local port="$1"
  python3 -m http.server "$port" --directory "$PROJECT_ROOT" >"$LOG_FILE" 2>&1 &
  SERVER_PID=$!
  sleep 1
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    printf 'Serving %s on http://localhost%s (logs: %s)\n' "$PROJECT_ROOT" \
      "$([[ "$port" -eq 80 ]] && printf '' || printf ':%s' "$port")" \
      "$LOG_FILE"
    return 0
  fi

  wait "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
  return 1
}

open_browser() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
  else
    printf 'No system opener found. Please open %s manually.\n' "$url" >&2
  fi
}

require_python

if ! start_server "$TARGET_PORT"; then
  if [[ "$TARGET_PORT" -eq 80 ]]; then
    printf 'Port 80 unavailable (needs elevated permissions). Falling back to %s...\n' "$FALLBACK_PORT"
    TARGET_PORT="$FALLBACK_PORT"
    start_server "$TARGET_PORT" || {
      cat "$LOG_FILE" >&2
      exit 1
    }
  else
    cat "$LOG_FILE" >&2
    exit 1
  fi
fi

if [[ "$TARGET_PORT" -eq 80 ]]; then
  MAIN_URL="http://localhost/index.html"
else
  MAIN_URL="http://localhost:${TARGET_PORT}/index.html"
fi

printf 'Opening %s ...\n' "$MAIN_URL"
open_browser "$MAIN_URL"
printf 'Press Ctrl+C to stop the server.\n'
wait "$SERVER_PID"
