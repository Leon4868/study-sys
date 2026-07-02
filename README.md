# LearnTrack 个人学习管理系统

一个面向个人用户的轻量级学习管理工具。它帮助你记录每天学了什么、回顾学习历史、统计学习投入，并把零散的学习过程沉淀成清晰的成长档案。

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)
![React](https://img.shields.io/badge/React-19-61dafb)
![Hono](https://img.shields.io/badge/Hono-API-orange)
![tRPC](https://img.shields.io/badge/tRPC-TypeSafe-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169e1)
![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-ef4444)

## 项目亮点

- 学习仪表盘：展示今日记录状态、累计学习天数、累计时长、本周时长和最近记录。
- 学习记录管理：支持新增、编辑、删除、查看详情和列表筛选。
- 统计概览：按日期聚合学习天数与时长，帮助观察学习习惯。
- 账号系统：基于 Better Auth 的邮箱密码登录和会话管理。
- 桌面端设计：参考 Stitch 设计稿，采用固定侧边栏、浅色学术风格和高密度表格布局。
- 现代全栈：React + TanStack Router + Hono + tRPC + Drizzle + PostgreSQL。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| Web | React, Vite, TanStack Router, TanStack Query, Tailwind CSS, PWA, Tauri |
| API | Hono, tRPC, Better Auth |
| Database | PostgreSQL, Drizzle ORM, Drizzle Kit |
| Monorepo | pnpm workspaces, Turborepo |
| UI | Shared UI package, Base UI, shadcn-style primitives, lucide-react |

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 准备环境变量

创建 `apps/server/.env`：

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
BETTER_AUTH_SECRET=replace-with-at-least-32-chars-secret
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
```

创建 `apps/web/.env`：

```env
VITE_SERVER_URL=http://localhost:3000
```

### 3. 准备数据库

项目使用 PostgreSQL。确认数据库已启动后，将 Drizzle schema 推送到数据库：

```bash
pnpm run db:push
```

如果需要本地测试账号：

```bash
pnpm --dir apps/server run db:seed
```

默认测试账号：

```text
Email: test@study-sys.local
Password: Test12345!
```

### 4. 启动开发服务

同时启动 Web 和 API：

```bash
pnpm run dev
```

也可以分开启动：

```bash
pnpm run dev:server
pnpm run dev:web
```

默认访问地址：

| 服务 | 地址 |
| --- | --- |
| Web | http://localhost:3001 |
| API | http://localhost:3000 |

## 功能模块

### 登录

- 邮箱密码登录
- 会话校验
- 未登录用户自动跳转到 `/login`

### 仪表盘

- 今日是否已记录
- 累计学习天数
- 累计学习时长
- 本周学习时长
- 最近学习记录
- 学习热度和学习引言卡片

### 学习记录

- `/records`：学习记录列表
- `/records/new`：新增学习记录
- `/records/:id`：记录详情
- `/records/:id/edit`：编辑学习记录

记录字段包括：

- 学习日期
- 学习主题
- 学习分类
- 学习时长
- 学习内容
- 学习收获
- 遇到的问题
- 下一步计划
- 学习状态

## 项目结构

```text
study-sys/
├── apps/
│   ├── web/              # React 前端应用
│   ├── server/           # Hono + tRPC API 服务
│   └── fumadocs/         # 文档站预留应用
├── packages/
│   ├── api/              # tRPC router 与业务接口
│   ├── auth/             # Better Auth 配置
│   ├── db/               # Drizzle schema 与数据库连接
│   ├── env/              # Web / Server 环境变量校验
│   ├── ui/               # 共享 UI 组件
│   └── config/           # 共享配置
├── package.json
└── README.md
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 启动所有开发服务 |
| `pnpm run dev:web` | 只启动前端 |
| `pnpm run dev:server` | 只启动 API |
| `pnpm run build` | 构建所有应用 |
| `pnpm run check-types` | 检查 TypeScript 类型 |
| `pnpm run db:push` | 将 schema 同步到数据库 |
| `pnpm run db:generate` | 生成 Drizzle migration |
| `pnpm run db:migrate` | 执行 Drizzle migration |
| `pnpm run db:studio` | 打开 Drizzle Studio |
| `pnpm --dir apps/server run db:seed` | 创建本地测试账号 |
| `pnpm --dir apps/web run desktop:dev` | 启动 Tauri 桌面端开发 |
| `pnpm --dir apps/web run generate-pwa-assets` | 生成 PWA 图标资源 |

## AWS 部署

项目已提供可在 AWS 运行的部署配置：

- 后端：Hono API 打包为 AWS Lambda，通过 API Gateway HTTP API 暴露服务。
- 数据库：Amazon RDS PostgreSQL。
- 前端：Vite 静态产物部署到 S3 Website。

当前部署地址：

| 服务 | 地址 |
| --- | --- |
| Web | http://study-sys-web-124971231397-us-east-2.s3-website.us-east-2.amazonaws.com |
| API | https://46jpuo4jvf.execute-api.us-east-2.amazonaws.com |

部署命令：

```bash
./scripts/deploy-aws-backend.sh
./scripts/deploy-aws-frontend.sh
```

详细步骤、环境要求、数据库同步、测试账号初始化和清理命令见 `docs/aws-deployment.md`。

部署脚本会在 `.aws-deploy/` 下保存本地部署输出和随机生成的密钥，该目录已加入 `.gitignore`，不要手动提交。

## 数据库说明

核心业务表是 `study_record`，与 Better Auth 的 `user` 表通过 `user_id` 关联。

主要 schema 文件：

- `packages/db/src/schema/auth.ts`
- `packages/db/src/schema/study-record.ts`
- `packages/db/src/schema/todo.ts`

本地开发数据目录、环境变量和构建产物不会进入 Git：

- `.local-pg/`
- `.env`
- `.aws-deploy/`
- `apps/web/dist/`
- `apps/web/dev-dist/`
- `node_modules/`

## 开发备注

- 前端通过 `VITE_SERVER_URL` 连接 API。
- API 默认监听 `3000` 端口。
- Web 默认由 Vite 分配端口；当前本地配置常用 `3001`。
- 如果页面出现 `Failed to fetch`，优先确认 API 服务和 PostgreSQL 是否都已启动。
- `/records/:id` 与 `/records/:id/edit` 是父子路由：父路由（`$id.tsx`）在编辑态下需渲染 `<Outlet />` 才能显示子路由的编辑表单，改动详情页时注意保留这段分流逻辑。

## 项目状态

- 全部 4 个 feature（登录、学习记录数据与 API、学习记录页面、首页仪表盘）共 25 个开发任务已完成，各包 `check-types` 全绿。
- 全部联调测试任务已在可连接 PostgreSQL 的环境下用真实浏览器 + tRPC 请求验证通过（登录流程、学习记录 CRUD 接口与越权防护、学习记录页面全流程、首页统计展示）。详见 `specs/PLAN.md` 与 `specs/CHANGELOG-2026-07-02.md`。

## License

Private project.
