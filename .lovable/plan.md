## 目标

为"AI 能碳数值空间"添加独立登录页，登录后进入系统；顶栏右上角"管理员"变为可点击的下拉菜单，支持"退出登录"。UI 风格与专家评审、模拟自我评价等已有页面统一（同一套设计 token、卡片阴影、圆角、绿色主色渐变背景，参考 `ResetPassword.tsx` 的登录级页面风格）。

## 交互流程

1. 未登录访问任意受保护路由 → 自动跳转到 `/login`
2. `/login` 输入账号密码 → 校验通过写入本地登录态 → 跳回原目标路由（默认 `/`）
3. 顶栏"管理员"点击 → 下拉菜单显示当前账号 + "退出登录" → 退出后回到 `/login`

演示阶段无后端：使用 mock 账号（如 `admin / admin123`，任意非空也可放行，二选一）。登录态存 `localStorage`。

## 文件改动

**新增 `src/contexts/AuthContext.tsx`**
- `AuthProvider`：state `{ user: { name, account } | null }`，从 `localStorage("app.auth")` 恢复
- 暴露 `login(account, password)`、`logout()`、`isAuthenticated`
- `useAuth()` hook

**新增 `src/pages/Login.tsx`**
- 复用 `ResetPassword.tsx` 的视觉框架：`min-h-screen` + 渐变背景 + 居中卡片 + 顶部 Leaf 图标
- 标题「AI 能碳数值空间」，副标题「政企协同 · 绿色制造评价」
- 表单：账号 / 密码 / 显隐切换 / "记住我" / 登录按钮
- 校验失败 toast；成功后 `navigate(from, { replace: true })`

**新增 `src/components/RequireAuth.tsx`**
- 包裹路由，未登录 `<Navigate to="/login" state={{ from: location }} />`

**修改 `src/App.tsx`**
- `<RoleProvider>` 外再包一层 `<AuthProvider>`
- 新增 `<Route path="/login" element={<Login />} />`（放在受保护路由之前，公开）
- `/reset-password` 保持公开
- 其它所有路由用 `<RequireAuth>` 包裹（在 Routes 内统一处理，避免逐条改：可用一个通配 layout 路由或简单包裹每个 element；采用统一的 `wrap = (el) => <RequireAuth>{el}</RequireAuth>` 帮助函数最省改动）

**修改 `src/components/AppLayout.tsx`**
- 顶栏右上角"管理员"区域改为 shadcn `DropdownMenu`：
  - Trigger：现有头像 + "管理员"文字 + 下拉箭头
  - Content：显示当前账号（来自 `useAuth().user`），分隔线，`LogOut` 图标 + "退出登录"
  - 点击退出：`logout()` → `navigate("/login", { replace: true })` + toast

## 技术细节

- 登录态存储 key：`app.auth`，值 `{ account, name }`；退出时 `removeItem`
- Mock 校验规则：账号非空、密码 ≥ 6 位即通过；预置演示提示"演示账号 admin / admin123"
- 路由保护跳转保留 `location.state.from` 以便登录后回跳
- 视觉 token 全部使用现有语义色（`bg-primary`、`text-muted-foreground`、`bg-card` 等），不引入硬编码颜色
- 不动业务逻辑与后端相关代码；仅前端登录/登出闭环
