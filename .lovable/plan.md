## 登录页视觉改造方案

将 `/login` 页面重做为全屏背景图 + 品牌化布局，保持现有登录逻辑不变。

### 资源接入
- 使用 `lovable-assets` 将上传的两张图上传为 CDN 资源：
  - `src/assets/login-bg.jpg.asset.json`（图1 上海外滩天际线，作为全屏背景）
  - `src/assets/platform-logo.png.asset.json`（图2 青色 N 型 logo，作为平台 logo）

### 布局结构（src/pages/Login.tsx 重写）
```
┌─────────────────────────────────────────────┐
│ [Logo]  AI 能碳数智空间                      │  ← 左上角，logo 40px + 大标题 text-2xl
│                                             │
│                                             │
│              ┌───────────────────┐          │
│              │    用户登录         │          │  ← 卡片居中，标题 text-2xl 加粗
│              │  ───────────       │          │
│              │  账号  [_______]   │          │
│              │  密码  [_______]   │          │
│              │  □记住我   忘记密码 │          │
│              │  [   登   录   ]   │          │
│              └───────────────────┘          │
│                                             │
│         © 2026 · 安全链路 HTTPS 保护         │
└─────────────────────────────────────────────┘
背景：全屏铺满外滩图，覆盖一层深色渐变遮罩提升文字对比
```

### 关键设计细节
- **背景**：`min-h-screen` + `bg-cover bg-center`，叠加 `bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/60` 遮罩，保证左上标题与卡片可读。
- **左上品牌区**：`absolute top-6 left-8`，logo 图片 40×40 圆角，右侧平台名 `text-2xl font-semibold text-white tracking-wide`，副标题 `text-xs text-white/70`。
- **登录卡片**：`max-w-md` 居中，使用 `bg-background/95 backdrop-blur-md` 玻璃拟态，`shadow-2xl` `border-border/40`，卡片内标题改为「用户登录」`text-2xl font-bold tracking-wider`，替换原「账号登录」小标题。
- **演示账号提示、账号/密码输入、显示密码切换、记住我、忘记密码、登录按钮**：保留现有逻辑与语义 token（`text-primary` / `Button` 默认样式），仅调整字号与间距使更"大气"。
- **页脚**：底部居中 `text-white/60`，替代原卡片下方灰字。
- 仍复用 `useAuth().login()`，成功后 `navigate(from)`，失败 toast，不动业务逻辑。

### 涉及文件
- 新增 `src/assets/login-bg.jpg.asset.json`（via lovable-assets CLI）
- 新增 `src/assets/platform-logo.png.asset.json`（via lovable-assets CLI）
- 重写 `src/pages/Login.tsx`

不改动路由、AuthContext、AppLayout 或其它页面。
