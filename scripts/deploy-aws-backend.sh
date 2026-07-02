#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-study-sys}"
STACK_NAME="${STACK_NAME:-study-sys-backend}"
REGION="${AWS_REGION:-$(aws configure get region)}"
DEPLOY_DIR=".aws-deploy"
TEMPLATE_FILE="infra/aws/backend.yml"
ENV_FILE="${DEPLOY_DIR}/${STACK_NAME}.env"
ARTIFACT_KEY_PREFIX="${APP_NAME}/backend"

if [[ -z "${REGION}" ]]; then
  echo "AWS region is not configured. Set AWS_REGION or run: aws configure set region us-east-2" >&2
  exit 1
fi

mkdir -p "${DEPLOY_DIR}"

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
else
  DB_PASSWORD="$(openssl rand -base64 30 | tr -d '=+/' | cut -c1-24)"
  BETTER_AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
  {
    echo "DB_PASSWORD='${DB_PASSWORD}'"
    echo "BETTER_AUTH_SECRET='${BETTER_AUTH_SECRET}'"
  } > "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
fi

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
DEPLOY_BUCKET="${DEPLOY_BUCKET:-${APP_NAME}-deploy-${ACCOUNT_ID}-${REGION}}"
VPC_ID="${VPC_ID:-$(aws ec2 describe-vpcs --filters Name=is-default,Values=true --query 'Vpcs[0].VpcId' --output text --region "${REGION}")}"
SUBNET_IDS="${SUBNET_IDS:-$(aws ec2 describe-subnets --filters Name=vpc-id,Values="${VPC_ID}" Name=default-for-az,Values=true --query 'Subnets[].SubnetId' --output text --region "${REGION}" | tr '\t' ',')}"
ADMIN_CIDR="${ADMIN_CIDR:-$(curl -fsS https://checkip.amazonaws.com)/32}"
CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:3001}"

if [[ "${VPC_ID}" == "None" || -z "${VPC_ID}" ]]; then
  echo "Could not find a default VPC. Set VPC_ID and SUBNET_IDS explicitly." >&2
  exit 1
fi

if [[ -z "${SUBNET_IDS}" ]]; then
  echo "Could not find default subnets. Set SUBNET_IDS explicitly." >&2
  exit 1
fi

if ! aws s3api head-bucket --bucket "${DEPLOY_BUCKET}" --region "${REGION}" >/dev/null 2>&1; then
  if [[ "${REGION}" == "us-east-1" ]]; then
    aws s3api create-bucket --bucket "${DEPLOY_BUCKET}" --region "${REGION}" >/dev/null
  else
    aws s3api create-bucket \
      --bucket "${DEPLOY_BUCKET}" \
      --region "${REGION}" \
      --create-bucket-configuration LocationConstraint="${REGION}" >/dev/null
  fi
fi

pnpm --dir apps/server run build

rm -f "${DEPLOY_DIR}/backend.zip"
(cd apps/server/dist && zip -qr "../../../${DEPLOY_DIR}/backend.zip" .)

CODE_S3_KEY="${ARTIFACT_KEY_PREFIX}/backend-$(date +%Y%m%d%H%M%S).zip"
aws s3 cp "${DEPLOY_DIR}/backend.zip" "s3://${DEPLOY_BUCKET}/${CODE_S3_KEY}" --region "${REGION}" >/dev/null

aws cloudformation deploy \
  --stack-name "${STACK_NAME}" \
  --template-file "${TEMPLATE_FILE}" \
  --capabilities CAPABILITY_IAM \
  --region "${REGION}" \
  --parameter-overrides \
    AppName="${APP_NAME}" \
    CodeS3Bucket="${DEPLOY_BUCKET}" \
    CodeS3Key="${CODE_S3_KEY}" \
    VpcId="${VPC_ID}" \
    SubnetIds="${SUBNET_IDS}" \
    AdminCidr="${ADMIN_CIDR}" \
    CorsOrigin="${CORS_ORIGIN}" \
    DbPassword="${DB_PASSWORD}" \
    BetterAuthSecret="${BETTER_AUTH_SECRET}"

API_URL="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)"
DB_ENDPOINT="$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
  --output text)"

DATABASE_URL="postgresql://studysys_admin:${DB_PASSWORD}@${DB_ENDPOINT}:5432/studysys?sslmode=require&uselibpqcompat=true"

cat > "${DEPLOY_DIR}/${STACK_NAME}.outputs.env" <<EOF
AWS_REGION='${REGION}'
STACK_NAME='${STACK_NAME}'
API_URL='${API_URL}'
DATABASE_URL='${DATABASE_URL}'
VITE_SERVER_URL='${API_URL}'
CORS_ORIGIN='${CORS_ORIGIN}'
EOF
chmod 600 "${DEPLOY_DIR}/${STACK_NAME}.outputs.env"

echo "Backend deployed."
echo "API_URL=${API_URL}"
echo "Outputs saved to ${DEPLOY_DIR}/${STACK_NAME}.outputs.env"
echo
echo "Next database step:"
echo "  source ${DEPLOY_DIR}/${STACK_NAME}.outputs.env && DATABASE_URL=\"\$DATABASE_URL\" pnpm run db:push"
