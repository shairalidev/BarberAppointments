#!/usr/bin/env bash
set -euo pipefail

DOMAINS="${TLS_DOMAINS:-www.ates-barberos.com}"
CERT_NAME="${TLS_CERT_NAME:-www.ates-barberos.com}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root (or with sudo)." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y certbot python3-certbot-nginx
systemctl enable --now certbot.timer

if certbot certificates --cert-name "$CERT_NAME" 2>/dev/null | grep -q "Certificate Name:"; then
  certbot renew --cert-name "$CERT_NAME" --non-interactive \
    --deploy-hook "systemctl reload nginx"
else
  domain_args=()
  IFS=',' read -ra domain_list <<< "$DOMAINS"
  for domain in "${domain_list[@]}"; do
    domain_args+=(--domain "${domain//[[:space:]]/}")
  done

  # Every requested name must resolve to this server and allow inbound port 80.
  certbot --nginx --non-interactive --agree-tos --redirect \
    --register-unsafely-without-email --cert-name "$CERT_NAME" \
    "${domain_args[@]}"
fi

nginx -t
systemctl reload nginx
certbot certificates --cert-name "$CERT_NAME"
