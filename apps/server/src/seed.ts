import dotenv from "dotenv";

// 必须在 import @study-sys/auth / @study-sys/env 之前加载 .env，
// 因为 packages/env/src/server.ts 会在模块加载时立即校验环境变量。
dotenv.config({ path: "../../apps/server/.env" });

import { auth } from "@study-sys/auth";
import { db } from "@study-sys/db";
import { user } from "@study-sys/db/schema/auth";
import { eq } from "drizzle-orm";

// 测试账号固定邮箱/密码 — 仅限本地开发环境使用，不要用于生产环境。
const TEST_USER_EMAIL = "test@study-sys.local";
const TEST_USER_PASSWORD = "Test12345!";
const TEST_USER_NAME = "Test User";

async function seed() {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, TEST_USER_EMAIL),
  });

  if (existing) {
    console.log(`[seed] 测试账号已存在（${TEST_USER_EMAIL}），跳过创建。`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      name: TEST_USER_NAME,
    },
  });

  console.log(`[seed] 已创建测试账号：${TEST_USER_EMAIL}`);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("[seed] 创建测试账号失败：", error);
    process.exit(1);
  });
