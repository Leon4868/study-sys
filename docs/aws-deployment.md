# AWS Deployment

This project can run the API on AWS Lambda with API Gateway HTTP API and RDS PostgreSQL.

## Backend

Deploy or update the backend stack:

```bash
./scripts/deploy-aws-backend.sh
```

The script builds `apps/server`, uploads the Lambda bundle to S3, and deploys:

- Lambda function: `study-sys-server`
- API Gateway HTTP API
- RDS PostgreSQL instance: `study-sys-postgres`
- Security groups for Lambda and PostgreSQL

Deployment outputs are written to:

```text
.aws-deploy/study-sys-backend.outputs.env
```

Push database schema after the first deploy:

```bash
source .aws-deploy/study-sys-backend.outputs.env
DATABASE_URL="$DATABASE_URL" pnpm --dir packages/db run db:push
```

Seed the test account in AWS RDS:

```bash
source .aws-deploy/study-sys-backend.outputs.env
BETTER_AUTH_SECRET="$(sed -n "s/^BETTER_AUTH_SECRET='\(.*\)'/\1/p" .aws-deploy/study-sys-backend.env)" \
BETTER_AUTH_URL="$API_URL" \
CORS_ORIGIN="http://localhost:3001" \
DATABASE_URL="$DATABASE_URL" \
pnpm --dir apps/server run db:seed
```

## Frontend Build Against AWS API

```bash
source .aws-deploy/study-sys-backend.outputs.env
VITE_SERVER_URL="$API_URL" pnpm --dir apps/web run build
```

Deploy the frontend to S3 static website hosting:

```bash
./scripts/deploy-aws-frontend.sh
```

Then update the backend CORS/Better Auth trusted origin to the frontend URL:

```bash
source .aws-deploy/study-sys-frontend.outputs.env
CORS_ORIGIN="$SITE_URL" ./scripts/deploy-aws-backend.sh
```

Current AWS account note: CloudFront creation failed with an AWS account verification error, so the frontend template uses S3 website hosting. The URL is HTTP. After the account is verified for CloudFront, replace `infra/aws/frontend.yml` with a CloudFront distribution if HTTPS is required.

## Cost Cleanup

The stack includes an RDS instance and will incur AWS cost while it exists. Delete it when not needed:

```bash
aws cloudformation delete-stack --stack-name study-sys-backend --region us-east-2
aws cloudformation delete-stack --stack-name study-sys-frontend --region us-east-2
```

RDS has `DeletionPolicy: Snapshot`, so deleting the stack keeps a final snapshot by design.
