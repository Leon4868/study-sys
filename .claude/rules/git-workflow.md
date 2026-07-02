---
description: Git 工作流规范
---

# Git 工作流

- 仓库目前只有一个 "initial commit"，尚未形成 commit message 或分支命名的既定规范——新提交前优先与用户确认偏好，不要凭空套用约定。
- `pnpm prepare` 会安装 git hooks，`.husky/pre-commit` 执行 `lint-staged`（当前 `lint-staged` 配置为空 glob 模式，未接入实际 lint 命令），提交前确保 `pnpm check-types` 通过，不要绕过 pre-commit hook（`--no-verify`）。
- monorepo 内改动跨多个包（如同时改 `packages/db` schema 和 `packages/api` router）时，建议放在同一次提交中，保持 Drizzle schema 与依赖它的 tRPC router 改动原子化。
- 不要提交 `node_modules/`、`.turbo/`、`dist/`、`.next/`、各包 `.env` 等已被 `.gitignore` 排除的产物。
