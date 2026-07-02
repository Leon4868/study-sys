---
description: 前端开发规范
globs: apps/web/**, apps/fumadocs/**, packages/ui/**
---

# 前端

- `apps/web` 使用 TanStack Router 的文件路由（`src/routes/`），需要登录态保护的页面放在 `src/routes/_auth/` 目录下，自动继承 `_auth/route.tsx` 中 `beforeLoad` 的会话校验与未登录跳转 `/login` 逻辑，不要在具体页面里重复实现登录检查。
- 数据请求统一通过 `src/utils/trpc.ts` 暴露的 `trpc` 客户端 + `@tanstack/react-query` 的 `useQuery`/`useMutation`（参考 `src/routes/todos.tsx`），不要直接用 `fetch` 调后端。
- 表单使用 `@tanstack/react-form` + zod validators（参考 `src/components/sign-in-form.tsx`），字段级错误通过 `field.state.meta.errors` 渲染。
- UI 组件优先复用 `@study-sys/ui`（`packages/ui/src/components/*`），新增共享原语通过 `npx shadcn@latest add <component> -c packages/ui` 引入（见根目录 README）；只有页面专属、不跨 app 复用的组件才直接写在 `apps/web/src/components/`。
- 全局样式与设计 token 改动在 `packages/ui/src/styles/globals.css`，不要在 `apps/web` 内重复定义 Tailwind 主题变量。
- Tauri 桌面端相关代码隔离在 `apps/web/src-tauri/`，调整 Web 端逻辑时注意是否会影响桌面端打包（`pnpm desktop:build`）。
- `apps/fumadocs` 是独立的 Next.js 文档站，内容放在 `apps/fumadocs/content/`，与 `apps/web` 的路由/状态管理方式相互独立，不要混用 TanStack Router 的写法。
