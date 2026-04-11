#!/usr/bin/env bash
# Build, push, and deploy frontend to local minikube.
# Usage: ./scripts/deploy-local.sh

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
SERVICE="abdvswmdr/soqonifrontend"
MANIFEST="$HOME/soqoni-k8s/frontend.yaml"
DEPLOYMENT="frontend"
TAG=$(git -C "$REPO_ROOT" rev-parse --short HEAD)

echo "==> Tag: $TAG"

# Build and push
"$REPO_ROOT/scripts/build-and-push.sh"

# Swap the image tag in the manifest
OLD_TAG=$(grep "image: $SERVICE" "$MANIFEST" | grep -oE '[a-f0-9]{7}$' || true)
sed -i "s|image: $SERVICE:.*|image: $SERVICE:$TAG|" "$MANIFEST"
echo "==> Manifest updated: $OLD_TAG -> $TAG"

# Scale down so the old image is released, then remove it from minikube cache
kubectl scale deployment "$DEPLOYMENT" --replicas=0
kubectl wait --for=delete pod -l app="$DEPLOYMENT" --timeout=30s 2>/dev/null || true
if [ -n "$OLD_TAG" ] && [ "$OLD_TAG" != "$TAG" ]; then
    minikube image rm "$SERVICE:$OLD_TAG" 2>/dev/null && echo "==> Removed cached $OLD_TAG" || true
fi

# Apply and scale back up
kubectl apply -f "$MANIFEST"
kubectl scale deployment "$DEPLOYMENT" --replicas=2
kubectl rollout status deployment/"$DEPLOYMENT"
echo "==> Done. Frontend running at http://$(minikube ip)"
