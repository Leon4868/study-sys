---
description: 安全规范
---

# 安全

- 密钥与连接串只放在各包 `.env` 文件中（`apps/web/.env`、`apps/server/.env`），均已被 `.gitignore` 排除，不要提交 `.env` 到 git，也不要把密钥硬编码进源码。
- 环境变量统一通过 `@study-sys/env`（`packages/env`，基于 `@t3-oss/env-core` + zod）读取和校验，不要在业务代码里直接读 `process.env.XXX`，新增变量需先在 `packages/env/src/server.ts` 或 `web.ts` 中声明 schema。
- 鉴权统一走 `@study-sys/auth`（Better-Auth + Drizzle adapter），不要自行实现密码哈希、session 或 token 逻辑。
- tRPC procedure 涉及用户私有数据时必须使用 `protectedProcedure`（`packages/api/src/index.ts`），并在数据库查询的 `where` 条件中显式限制当前用户（如 `userId`），不要仅依赖应用层"事后过滤"。
- 登录失败等面向用户的错误提示不要泄露账号是否存在等信息（防止账号枚举），统一返回模糊提示。
- `better-auth` 的 `defaultCookieAttributes` 已配置 `httpOnly`/`secure`/`sameSite: "none"`（见 `packages/auth/src/index.ts`），调整该配置前需确认对跨域 cookie 行为的影响。
