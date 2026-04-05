#!/usr/bin/env bash
# Build and push soqonifrontend image.
# Tags with git SHA (immutable). Tags :latest only on main branch.
# Usage:
#   ./scripts/build-and-push.sh           # build + push
#   ./scripts/build-and-push.sh --local   # build + load into minikube, no push

set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
IMAGE="abdvswmdr/soqonifrontend"
TAG=$(git -C "$REPO_ROOT" rev-parse --short HEAD)
BRANCH=$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD)
LOCAL_ONLY=false

if [[ "${1:-}" == "--local" ]]; then
    LOCAL_ONLY=true
fi

echo "==> Tag:    $TAG"
echo "==> Branch: $BRANCH"
echo "==> Mode:   $([ "$LOCAL_ONLY" = true ] && echo 'local (minikube)' || echo 'push to Docker Hub')"
echo ""

echo "==> Building $IMAGE:$TAG"
docker build -t "$IMAGE:$TAG" "$REPO_ROOT"

if [ "$LOCAL_ONLY" = true ]; then
    echo "==> Loading image into minikube"
    minikube image load "$IMAGE:$TAG"
    echo ""
    echo "Done. Update your k8s manifest:"
    echo "  soqoni-k8s/frontend.yaml -> image: $IMAGE:$TAG"
    exit 0
fi

echo "==> Pushing $IMAGE:$TAG"
docker push "$IMAGE:$TAG"

if [[ "$BRANCH" == "main" ]]; then
    echo "==> On main — tagging and pushing :latest"
    docker tag "$IMAGE:$TAG" "$IMAGE:latest"
    docker push "$IMAGE:latest"
else
    echo "==> Not on main ($BRANCH) — skipping :latest"
fi

echo ""
echo "Done. Update your k8s manifest:"
echo "  soqoni-k8s/frontend.yaml -> image: $IMAGE:$TAG"
