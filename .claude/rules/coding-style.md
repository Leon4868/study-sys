---
description: TypeScript/代码风格规范
---

# 代码风格

- 全项目使用 TypeScript strict 模式（见 `packages/config/tsconfig.base.json`），不要关闭 `strict`/`noUnusedLocals`/`noUnusedParameters` 等检查。
- `verbatimModuleSyntax` 已开启：类型导入使用 `import type { Foo } from "..."`，不要与值导入混用未标注的类型导入。
- 模块统一使用 ESM（`"type": "module"`），不要引入 CommonJS（`require`/`module.exports`）。
- 跨包引用通过 workspace 包名（如 `@study-sys/db`、`@study-sys/api`），不要使用相对路径穿透包边界（如 `../../packages/db/src`）。
- 共享依赖版本通过 `pnpm-workspace.yaml` 的 `catalog:` 管理，新增/升级 `react`、`zod`、`drizzle-orm`、`trpc`、`hono`、`better-auth` 等共享依赖时优先复用 catalog 版本，而不是在单个包里锁定不同版本。
- 项目未配置 ESLint/Prettier，提交前依赖 `husky` + `lint-staged`（见 `.husky/pre-commit`），保持现有文件的缩进、引号风格与已有代码一致。
- Drizzle schema 文件（`packages/db/src/schema/*.ts`）按表名拆分文件，并在 `schema/index.ts` 中统一导出。
- tRPC router 文件（`packages/api/src/routers/*.ts`）按业务领域拆分，procedure 命名使用动词风格的小驼峰（如 `getAll`、`create`、`toggle`、`delete`）。
