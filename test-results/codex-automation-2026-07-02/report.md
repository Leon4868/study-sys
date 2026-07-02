# Codex 自动化测试报告

测试日期：2026-07-02  
项目：study-sys / LearnTrack 个人学习管理系统  
测试方式：Chrome 可执行文件 + Playwright 自动化；尝试接入 Chrome DevTools MCP/扩展通道但当前会话不可用。  
测试环境：Web `http://localhost:3001`，API `http://localhost:3000`，测试账号 `test@study-sys.local`。

## 结论

整体核心链路部分可用：构建、登录、鉴权跳转、仪表盘展示、新增学习记录、详情展示、删除记录、移动端登录页无横向溢出均通过。

本轮发现 2 个需要修复的问题：

1. 记录编辑页不可达。访问 `/records/:id/edit` 仍渲染详情页，编辑表单没有出现。
2. 多处 `Button render={<Link />}` 触发 Base UI 控制台错误，存在按钮/链接语义与可访问性风险。

## 执行摘要

| 检查项 | 结果 |
| --- | --- |
| `pnpm --dir apps/web run build` | 通过 |
| `pnpm --dir apps/server run build` | 通过，有 `tsdown noExternal` deprecation warning |
| API 启动 | 通过，监听 `http://localhost:3000` |
| Web 启动 | 通过，监听 `http://localhost:3001` |
| Seed 测试账号 | 通过，账号已存在 |
| 未登录访问 `/dashboard` 跳转 `/login` | 通过 |
| 测试账号登录进入 `/dashboard` | 通过 |
| 仪表盘统计/入口模块可见 | 通过 |
| 打开 `/records/new` 新增表单 | 通过 |
| 新增学习记录并进入详情页 | 通过 |
| 详情页字段展示 | 通过 |
| 详情页删除记录 | 通过 |
| 移动端登录页 390px 宽度无横向溢出 | 通过 |
| 编辑记录 | 失败，编辑页未渲染 |

## 发现的问题

### P1 - 编辑记录页面无法渲染

现象：

- 自动化创建记录后，在详情页点击“编辑”，页面停留在详情内容，`#title` 等编辑表单字段不存在。
- 直接访问 `/records/{id}/edit`，仍显示详情页，等待“编辑学习记录/修改并保存学习记录”超时。

定位：

- 路由树中 `/records/$id/edit` 是 `/records/$id` 的子路由。
- 父组件 `apps/web/src/routes/_auth/records/$id.tsx` 只渲染详情卡片和删除弹窗，没有渲染子路由出口 `Outlet`。
- 相关位置：`apps/web/src/routes/_auth/records/$id.tsx:19`、`apps/web/src/routes/_auth/records/$id.tsx:85`。

影响：

- 用户无法通过 UI 或 URL 进入编辑表单。
- 新增后的记录只能查看/删除，无法修改。

建议：

- 在详情父路由中根据当前匹配渲染 `Outlet`，或把编辑页改成非嵌套路由文件结构。
- 修复后补充 e2e 用例：创建记录 -> 进入编辑 -> 修改标题/时长 -> 保存 -> 详情验证。

### P2 - Link 被作为 Button 渲染时触发 Base UI 语义错误

现象：

- 控制台多次输出 Base UI 错误：组件按按钮语义工作，但 `render` 传入了非原生 `<button>`，会影响表单和可访问性。
- 自动化日志中该错误出现在 Header、Dashboard、Record detail、Records list 等多个页面。

定位示例：

- `packages/ui/src/components/button.tsx:47` 默认使用 Base UI ButtonPrimitive。
- `apps/web/src/components/header.tsx:57` 使用 `Button render={<Link to="/records/new" />}`。
- `apps/web/src/routes/_auth/dashboard.tsx:40` 使用 `Button render={<Link to="/records/new" />}`。
- `apps/web/src/routes/_auth/records/$id.tsx:107` 和 `apps/web/src/routes/_auth/records/$id.tsx:110` 使用 `Button render={<Link />}`。

影响：

- 开发环境控制台持续报错，真实用户的键盘/读屏语义可能不稳定。
- 详情页“编辑”点击未导航与该问题同时出现，虽然编辑页不可达的根因还包括缺少 `Outlet`。

建议：

- 对作为 Link 渲染的 Button 明确设置 Base UI 推荐属性，例如 `nativeButton={false}`，或封装独立 `ButtonLink`。
- 修复后用 Playwright 断言控制台不再出现 Base UI error。

## 控制台与网络

- `pageerror`：无。
- HTTP 4xx/5xx：无业务接口错误。
- 失败请求：测试过程中出现若干 `net::ERR_ABORTED`，主要来自页面跳转时中断的 Vite 模块请求和字体请求，未影响已通过流程。
- 控制台错误：Base UI Button 语义错误，详见 P2。
- 控制台提示：登录页 password input 缺少 `autocomplete="current-password"`，建议作为可访问性/表单体验优化项处理。

## 测试产物

- 原始结果：`test-results/codex-automation-2026-07-02/raw-results.json`
- 截图：
  - `01-dashboard.png`
  - `02-new-record-form.png`
  - `03-record-detail-created.png`
  - `failed-07.png`
  - `failed-cont-2.png`
  - `10-record-deleted.png`
  - `07-mobile-login.png`

## 环境限制

Chrome DevTools MCP/扩展通道在当前 Codex 会话不可用：`agent.browsers.list()` 返回空数组，`extension` backend 不可用。因此本轮使用本机 Google Chrome 可执行文件由 Playwright 驱动完成自动化，仍覆盖了真实 Chrome 渲染、交互、控制台和网络事件采集。
