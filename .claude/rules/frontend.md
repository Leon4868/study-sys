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
- 详情/编辑这类父子路由（如 `records/$id.tsx` 与 `records/$id.edit.tsx`）中，父路由组件必须根据当前路径判断是否处于编辑态并渲染 `<Outlet />`，否则子路由会被父路由的详情视图直接吃掉、无法渲染；参考 `apps/web/src/routes/_auth/records/$id.tsx` 用 `useRouterState` 判断 `isEditing` 的写法。
- `@study-sys/ui` 的 `Button` 支持以 `render={<Link ... />}` 的方式渲染为链接；此时不要手动传 `nativeButton={false}` 覆盖，组件已按 `render` 是否为原生 `<button>` 自动推断 `nativeButton`，手动覆盖可能重新触发 Base UI 的语义报错。
