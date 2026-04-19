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
K8S_DIR="$REPO_ROOT/../soqoni-k8s"

if [[ "${1:-}" == "--local" ]]; then
    LOCAL_ONLY=true
fi

patch_manifests() {
    if [ ! -d "$K8S_DIR" ]; then
        echo "WARN: $K8S_DIR not found — skipping manifest patch"
        return
    fi
    echo "==> Patching k8s manifests with tag $TAG"
    sed -i "s|image: $IMAGE:.*|image: $IMAGE:$TAG|g" "$K8S_DIR/frontend.yaml"
    echo "    frontend.yaml -> $IMAGE:$TAG"
}

echo "==> Tag:    $TAG"
echo "==> Branch: $BRANCH"
echo "==> Mode:   $([ "$LOCAL_ONLY" = true ] && echo 'local (minikube)' || echo 'push to Docker Hub')"
echo ""

echo "==> Building $IMAGE:$TAG"
docker build -t "$IMAGE:$TAG" "$REPO_ROOT"

if [ "$LOCAL_ONLY" = true ]; then
    echo "==> Loading image into minikube (overwrite)"
    minikube image load --overwrite=true "$IMAGE:$TAG"
    patch_manifests
    echo "==> Applying manifest"
    kubectl apply -f "$K8S_DIR/frontend.yaml"
    echo "==> Setting imagePullPolicy=Never for local image"
    kubectl patch deployment frontend -p '{"spec":{"template":{"spec":{"containers":[{"name":"frontend","imagePullPolicy":"Never"}]}}}}'
    echo "==> Restarting deployment to pick up new image"
    kubectl rollout restart deployment/frontend
    kubectl rollout status deployment/frontend
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

patch_manifests
echo ""
echo "Done. Apply with: kubectl apply -f $K8S_DIR/frontend.yaml"
