---
description: 数据库与 Drizzle 规范
globs: packages/db/**
---

# 数据库

- ORM 为 Drizzle，PostgreSQL 驱动 `pg`，schema 定义在 `packages/db/src/schema/*.ts`，按表拆分文件并在 `schema/index.ts` 用 `export * from "./xxx"` 统一导出。
- better-auth 相关表（`user`/`session`/`account`/`verification`，见 `schema/auth.ts`）由 better-auth 管理结构契约，不要手动修改其字段语义；业务表通过 `references(() => user.id, { onDelete: "cascade" })` 关联用户，外键类型需与 `user.id`（`text`）保持一致，不要用 `serial`/`integer` 做用户关联主键。
- 时间戳字段统一用 `timestamp(...).defaultNow().notNull()`，更新时间用 `$onUpdate(() => new Date())`（参考 `schema/auth.ts`）。
- 需要按字段过滤/排序的列（尤其是外键 `userId`、日期类字段）要加 `index()`（参考 `session_userId_idx` 的写法），避免列表查询全表扫描。
- schema 改动后用 `pnpm db:generate` 生成迁移、`pnpm db:push` 同步到数据库（开发环境）；不要手写 SQL migration 文件绕过 drizzle-kit。
- 查询逻辑写在 `packages/api` 的 router 里，`packages/db` 只负责 schema 定义与 `createDb()` 客户端导出，不要在 `packages/db` 里写业务查询函数。
