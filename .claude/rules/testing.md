---
description: 测试约定
---

# 测试

- 当前仓库没有配置任何测试框架（无 Vitest/Jest/Playwright 依赖，无 `test`/`*.test.ts` 文件，无 `test` script）。新增测试前需先与团队确认测试框架选型，不要假设某个框架已存在。
- 各包的 `check-types`（`tsc --noEmit` / `tsc -b` / `vite build && tsc --noEmit`）是当前唯一的自动化校验手段，提交前至少运行根目录 `pnpm check-types` 确认全部包类型检查通过。
- 涉及 tRPC procedure 或 Drizzle schema 改动时，优先通过 `pnpm db:push`/`pnpm db:studio` 配合手动调用接口验证行为，而不是臆造测试用例文件。
- 引入测试框架时优先与现有技术栈对齐：前端（Vite + React）适合 Vitest + Testing Library，服务端（Hono + tRPC）适合 Vitest 做 procedure 单测。
