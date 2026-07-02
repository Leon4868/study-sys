#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-study-sys}"
FRONTEND_STACK_NAME="${FRONTEND_STACK_NAME:-study-sys-frontend}"
REGION="${AWS_REGION:-$(aws configure get region)}"
DEPLOY_DIR=".aws-deploy"
TEMPLATE_FILE="infra/aws/frontend.yml"
BACKEND_OUTPUTS="${DEPLOY_DIR}/study-sys-backend.outputs.env"

if [[ -z "${REGION}" ]]; then
  echo "AWS region is not configured. Set AWS_REGION or run: aws configure set region us-east-2" >&2
  exit 1
fi

if [[ -f "${BACKEND_OUTPUTS}" ]]; then
  # shellcheck disable=SC1090
  source "${BACKEND_OUTPUTS}"
fi
STACK_NAME="${FRONTEND_STACK_NAME}"

VITE_SERVER_URL="${VITE_SERVER_URL:-${API_URL:-}}"
if [[ -z "${VITE_SERVER_URL}" ]]; then
  echo "VITE_SERVER_URL is required. Deploy backend first or set VITE_SERVER_URL." >&2
  exit 1
fi

aws cloudformation deploy \
  --stack-name "${STACK_NAME}" \
  --template-file "${TEMPLATE_FILE}" \
  --region "${REGION}" \
  --parameter-overrides AppName="${APP_NAME}"

BUCKET_NAME="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)"
SITE_URL="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='SiteUrl'].OutputValue" \
  --output text)"

VITE_SERVER_URL="${VITE_SERVER_URL}" pnpm --dir apps/web run build

aws s3 sync apps/web/dist "s3://${BUCKET_NAME}" \
  --region "${REGION}" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --exclude "manifest.webmanifest" \
  --exclude "sw.js" \
  --exclude "workbox-*.js" >/dev/null

aws s3 cp apps/web/dist/index.html "s3://${BUCKET_NAME}/index.html" \
  --region "${REGION}" \
  --content-type "text/html" \
  --cache-control "no-cache,no-store,must-revalidate" >/dev/null

for file in manifest.webmanifest sw.js workbox-*.js registerSW.js; do
  if compgen -G "apps/web/dist/${file}" >/dev/null; then
    for matched in apps/web/dist/${file}; do
      aws s3 cp "${matched}" "s3://${BUCKET_NAME}/$(basename "${matched}")" \
        --region "${REGION}" \
        --cache-control "no-cache,no-store,must-revalidate" >/dev/null
    done
  fi
done

cat > "${DEPLOY_DIR}/${STACK_NAME}.outputs.env" <<EOF
AWS_REGION='${REGION}'
FRONTEND_STACK_NAME='${STACK_NAME}'
FRONTEND_BUCKET_NAME='${BUCKET_NAME}'
SITE_URL='${SITE_URL}'
VITE_SERVER_URL='${VITE_SERVER_URL}'
EOF
chmod 600 "${DEPLOY_DIR}/${STACK_NAME}.outputs.env"

echo "Frontend deployed."
echo "SITE_URL=${SITE_URL}"
echo "Outputs saved to ${DEPLOY_DIR}/${STACK_NAME}.outputs.env"
