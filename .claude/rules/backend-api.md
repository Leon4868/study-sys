---
description: 后端 API 开发规范
globs: apps/server/**, packages/api/**
---

# 后端 API

- API 层是 Hono（`apps/server`，运行入口 `src/index.ts`）+ tRPC（`packages/api`），所有业务接口通过 tRPC router 暴露，不要在 `apps/server` 里直接写 REST handler 承载业务逻辑（health check 等极简场景除外）。
- 所有 procedure 在 `packages/api/src/routers/*.ts` 中定义，并在 `packages/api/src/routers/index.ts` 的 `appRouter` 中挂载；按业务领域拆分 router 文件（参考 `routers/todo.ts`）。
- 涉及用户私有数据的 procedure 一律使用 `protectedProcedure`（`packages/api/src/index.ts`），公开数据用 `publicProcedure`；`protectedProcedure` 会在 `ctx.session` 为空时自动抛 `UNAUTHORIZED`，业务代码内不要重复判空。
- procedure 的输入校验统一用 zod（`z.object({...})`），不要手写 if 校验必填字段；服务端权限相关字段（如 `userId`）一律从 `ctx.session.user.id` 取值，不要信任客户端传入。
- 数据库访问通过 `@study-sys/db` 暴露的 `db`（`createDb()`），查询语句用 drizzle-orm 的 query builder（`eq`/`and`/`gte`/`lte`/`desc` 等），不要拼接原生 SQL 字符串。
- 跨包业务逻辑放在 `packages/api`，`apps/server` 只负责挂载 Hono 路由、`trpc-server` adapter 与 `createContext`，避免业务逻辑下沉到 server app 层导致无法被其他 app（如未来的移动端/其他前端）复用。
