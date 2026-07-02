# study-sys

Better-T-Stack monorepo: React + TanStack Router web app, Tauri desktop shell, Hono + tRPC API server, Fumadocs docs site, Drizzle/PostgreSQL data layer, Better-Auth.

## 技术栈

- 语言: TypeScript (strict, ESNext, verbatim module syntax)
- 前端: React 19, TanStack Router/Query/Form, TailwindCSS 4, shadcn/ui (`packages/ui`), Tauri 2 (desktop)
- 后端: Hono + tRPC 11, Better-Auth, Node.js
- 数据库: PostgreSQL + Drizzle ORM
- 文档站: Next.js 16 + Fumadocs
- 构建/monorepo: Turborepo, pnpm workspaces + catalog
- 包管理: pnpm@11.9.0

## 常用命令

- 安装依赖: `pnpm install`
- 开发运行(全部): `pnpm dev`
- 仅前端: `pnpm dev:web`
- 仅后端: `pnpm dev:server`
- 构建: `pnpm build`
- 类型检查: `pnpm check-types`
- 数据库 push schema: `pnpm db:push`
- 数据库生成迁移: `pnpm db:generate`
- 数据库执行迁移: `pnpm db:migrate`
- 数据库 studio: `pnpm db:studio`
- Tauri 桌面端开发: `cd apps/web && pnpm desktop:dev`
- Tauri 桌面端构建: `cd apps/web && pnpm desktop:build`

## 目录结构

```
study-sys/
├── apps/
│   ├── web/         # React + TanStack Router + Vite + Tauri 前端
│   ├── server/      # Hono + tRPC 后端 API
│   └── fumadocs/    # Next.js + Fumadocs 文档站
├── packages/
│   ├── ui/          # 共享 shadcn/ui 组件与样式
│   ├── api/         # tRPC routers / 业务逻辑层
│   ├── auth/        # Better-Auth 配置
│   ├── db/          # Drizzle schema 与数据库客户端
│   ├── env/         # 类型安全的环境变量 (t3-oss/env-core)
│   └── config/      # 共享 tsconfig 基础配置
```

## 规则

@rules/coding-style.md
@rules/testing.md
@rules/security.md
@rules/git-workflow.md
@rules/frontend.md
@rules/backend-api.md
@rules/database.md
