#!/usr/bin/env bash
set -Eeuo pipefail

usage() { echo "Usage: DEPLOY_IMAGE=registry/name:sha [DRY_RUN=true] ./deploy/deploy.sh"; }
IMAGE=${DEPLOY_IMAGE:-}
DRY_RUN=${DRY_RUN:-false}
CANARY_STEPS=${CANARY_STEPS:-"10 25 50 100"}
[[ -n "$IMAGE" ]] || { usage >&2; exit 2; }
[[ "$IMAGE" =~ ^[a-zA-Z0-9._/-]+:[a-fA-F0-9]{7,64}$ ]] || { echo "DEPLOY_IMAGE must use an immutable commit SHA tag" >&2; exit 2; }
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.yml --env-file .deploy.env)
STABLE_IMAGE=${STABLE_IMAGE:-${BACKEND_IMAGE:-ci-quality-dashboard-backend:local}}
OLD_CANARY=${CANARY_IMAGE:-$STABLE_IMAGE}
STATE_FILE=.deploy-state
NGINX_FILE=deploy/nginx/nginx.conf
TMP_FILE=$(mktemp)
cleanup() { rm -f "$TMP_FILE"; }
trap cleanup EXIT

render_nginx() {
  local pct=$1 stable=$((100-pct))
  {
  cat <<'EOF'
events {}
http {
  upstream backend {
EOF
  (( stable == 0 )) || echo "    server stable:8080 weight=$stable;"
  (( pct == 0 )) || echo "    server canary:8080 weight=$pct;"
  cat <<'EOF'
  }
  server {
    listen 80;
    location /api/ { proxy_pass http://backend; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_next_upstream error timeout http_502 http_503 http_504; }
    location / { return 404; }
  }
}
EOF
  } > "$TMP_FILE"
  if [[ "$DRY_RUN" == true ]]; then echo "DRY RUN: would set canary traffic to ${pct}%"; return; fi
  cp "$TMP_FILE" "$NGINX_FILE"
  "${COMPOSE[@]}" exec -T gateway nginx -t
  "${COMPOSE[@]}" exec -T gateway nginx -s reload
}

rollback() {
  local old_stable=$1 old_canary=$2
  echo "Deployment failed; restoring stable image $old_stable" >&2
  if [[ "$DRY_RUN" != true ]]; then
    STABLE_IMAGE="$old_stable" CANARY_IMAGE="$old_canary" "${COMPOSE[@]}" up -d stable canary || true
    render_nginx 0 || true
    printf 'STABLE_IMAGE=%s\nCANARY_IMAGE=%s\n' "$old_stable" "$old_canary" > "$STATE_FILE"
    printf '{"status":"rollback","stableImage":"%s","canaryImage":"%s","trafficPercent":0,"lastResult":"failed","rollback":true,"updatedAt":"%s"}\n' "$old_stable" "$old_canary" "$(date -u +%FT%TZ)" > deploy/deployment-report.json
  fi
}

if [[ "$DRY_RUN" == true ]]; then
  echo "DRY RUN: no containers, config, or state will be changed. Target image: $IMAGE"
  for pct in $CANARY_STEPS; do [[ "$pct" =~ ^([1-9]|[1-9][0-9]|100)$ ]] || { echo "Invalid CANARY_STEPS value: $pct" >&2; exit 2; }; echo "DRY RUN: would validate and shift to $pct% canary"; done
  exit 0
fi

[[ -f .deploy.env ]] || { echo "Create .deploy.env on the server with database settings first" >&2; exit 2; }
if [[ -f "$STATE_FILE" ]]; then source "$STATE_FILE"; fi
STABLE_IMAGE=${STABLE_IMAGE:-${BACKEND_IMAGE:-ci-quality-dashboard-backend:local}}
OLD_STABLE=$STABLE_IMAGE
OLD_CANARY=${CANARY_IMAGE:-$STABLE_IMAGE}
if ! docker image inspect "$OLD_STABLE" >/dev/null 2>&1 && [[ ! -f "$STATE_FILE" ]]; then
  OLD_STABLE=$IMAGE
  OLD_CANARY=$IMAGE
fi
export BACKEND_IMAGE="$OLD_STABLE" CANARY_IMAGE="$IMAGE"
export FRONTEND_IMAGE="${FRONTEND_IMAGE:-ci-quality-dashboard-frontend:local}"
trap 'rollback "$OLD_STABLE" "$OLD_CANARY"' ERR

docker image inspect "$IMAGE" >/dev/null 2>&1 || docker pull "$IMAGE"
docker image inspect "$FRONTEND_IMAGE" >/dev/null 2>&1 || docker pull "$FRONTEND_IMAGE"
"${COMPOSE[@]}" up -d db stable canary gateway frontend
for attempt in {1..30}; do
  if "${COMPOSE[@]}" exec -T canary wget -q -O- http://127.0.0.1:8080/api/health >/dev/null; then break; fi
  [[ $attempt -lt 30 ]] || { echo "Canary did not become healthy" >&2; false; }
  sleep 2
done
for pct in $CANARY_STEPS; do
  [[ "$pct" =~ ^([1-9]|[1-9][0-9]|100)$ ]] || { echo "Invalid CANARY_STEPS value: $pct" >&2; false; }
  render_nginx "$pct"
  for attempt in {1..10}; do
    if "${COMPOSE[@]}" exec -T gateway wget -q -O- http://127.0.0.1/api/health >/dev/null; then break; fi
    [[ $attempt -lt 10 ]] || { echo "Gateway verification failed at ${pct}%" >&2; false; }
    sleep 2
  done
  sleep "${CANARY_OBSERVE_SECONDS:-5}"
done
export BACKEND_IMAGE="$IMAGE" CANARY_IMAGE="$IMAGE"
"${COMPOSE[@]}" up -d stable canary frontend
render_nginx 0
printf 'STABLE_IMAGE=%s\nCANARY_IMAGE=%s\n' "$IMAGE" "$IMAGE" > "$STATE_FILE"
printf '{"status":"healthy","stableImage":"%s","canaryImage":"%s","imageTag":"%s","commitSha":"%s","trafficPercent":0,"lastResult":"success","rollback":false,"updatedAt":"%s"}\n' "$IMAGE" "$IMAGE" "${IMAGE##*:}" "${IMAGE##*:}" "$(date -u +%FT%TZ)" > deploy/deployment-report.json
trap - ERR
echo "Deployment verified: $IMAGE"
