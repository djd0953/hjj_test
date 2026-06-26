#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$DIR/certs"
mkdir -p "$CERT_DIR"

KEY="$CERT_DIR/idp-private.pem"
CRT="$CERT_DIR/idp-cert.pem"

if [[ -f "$KEY" && -f "$CRT" ]]; then
  echo "[gen-cert] Existing cert found at $CRT — skip. Remove to regenerate." >&2
  exit 0
fi

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$KEY" \
  -out "$CRT" \
  -days 3650 \
  -subj "/CN=mock-hsad-idp"

chmod 600 "$KEY"
echo "[gen-cert] Wrote $KEY and $CRT"
