## 登录页重设计：沉浸式外滩 + 右侧浮动玻璃卡片

方向：整屏保留清晰外滩实景，登录卡片从"居中大块"改为"右侧竖向浮动的窄玻璃卡片"，让画面成为主角，卡片做点睛入口。清透蓝绿基调延续。

### 布局结构

```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] AI 能碳数智空间                                          │  ← 左上：品牌，白色文字带阴影
│        AI+ TRUSTED ENERGY-CARBON SMART DATA SPACE               │
│                                                                 │
│                                                    ┌──────────┐│
│                                                    │  用户登录 ││
│                                                    │  ─────    ││  ← 右侧浮动卡片
│                                                    │  账号      ││    宽 360-400
│      ✦ 智能 · 低碳 · 可信                          │  [_____]   ││    垂直居中
│      构建 AI+ 能碳可信数智空间                       │  密码      ││    毛玻璃 + 品牌绿细边高光
│      · 500 家企业协同  · 750 家链上确权              │  [_____]   ││
│                                                    │  □记住 忘记││
│                                                    │  [ 登 录 ] ││
│                                                    └──────────┘│
│                                                                 │
│                    © 2026 AI 能碳数智空间 · HTTPS 保护           │
└────────────────────────────────────────────────────────────────┘
外滩实景清晰铺满，仅底部做轻微暗化以确保页脚可读
```

### 关键设计

**背景层（不再虚化）**
- 外滩图 `object-cover` 铺满，去掉 `blur(2px)`。
- 只叠一层非常克制的暗化渐变：`bg-gradient-to-r from-slate-900/25 via-transparent to-slate-900/10`，保证左上品牌白字与右侧卡片周边都有足够对比但不遮画面。
- 底部再叠 `bg-gradient-to-t from-slate-900/40 to-transparent h-32` 让页脚可读。

**左上品牌区**（保留但更大气）
- Logo 白底圆角 44×44 + 微投影。
- 主标题「AI 能碳数智空间」`text-2xl font-semibold text-white drop-shadow-md`。
- 副标题英文 `text-[11px] tracking-[0.22em] text-white/80`。

**左侧品牌 Slogan 区（新增）**
- 竖排三行文字，垂直居中位于屏幕左 1/3：
  - 顶部小 tag：`✦ 智能 · 低碳 · 可信` `text-xs tracking-widest text-white/85` 带一条 12px 绿色小竖线前缀。
  - 主标语：`构建 AI+ 能碳可信数智空间` `text-3xl font-semibold text-white leading-snug drop-shadow`。
  - 底部数据点带：两个小 pill，`500 家企业协同` / `750 家链上确权`，`bg-white/15 backdrop-blur border-white/20 text-white/90 text-xs px-3 py-1 rounded-full`。

**右侧浮动登录卡片（重点）**
- 定位：`absolute right-[6vw] top-1/2 -translate-y-1/2`，`w-[380px]`。
- 样式：`rounded-3xl bg-white/85 backdrop-blur-2xl border border-white/60`，双层阴影 `0 1px 2px rgba(15,23,42,0.06), 0 30px 80px -20px rgba(15,23,42,0.35)`。
- 顶部装饰：卡片顶部内嵌一条 2px 高的 `bg-gradient-to-r from-transparent via-primary to-transparent` 细高光线，替代呆板边框。
- 内边距 `p-8`。
- 标题「用户登录」`text-lg font-medium tracking-[0.3em] text-slate-800`，居左而非居中（更现代），下方 `w-6 h-[2px] bg-primary` 小分隔条。
- 输入框：去掉外框只留下划线风格 —— `border-0 border-b border-slate-200 rounded-none bg-transparent focus-visible:border-primary focus-visible:ring-0 h-11 pl-7`，左侧图标 16px `text-slate-400`。这一步把"框中框"感消除，视觉更干净。
- 记住我 + 忘记密码：`text-xs text-slate-500`。
- 登录按钮：`w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground tracking-[0.4em] shadow-lg shadow-primary/25`。圆角胶囊形状 + 主色柔光，仪式感强。
- 演示账号提示改到卡片外底部，`text-[11px] text-white/70` 一行小字。

**页脚**
- `absolute bottom-4 inset-x-0` 居中，`text-[11px] text-white/70`。

### 响应式

- ≥1024px：左侧 slogan 区显示。
- <1024px：隐藏 slogan 区，卡片改为居中 `left-1/2 -translate-x-1/2`。用 Tailwind `hidden lg:block` / `lg:right-[6vw] lg:left-auto lg:translate-x-0`。

### 涉及文件

- 编辑 `src/pages/Login.tsx`：整体重写为上述结构。
- 复用现有资源 `src/assets/login-bg.jpg.asset.json`、`src/assets/platform-logo.png.asset.json`，无需重新上传。

登录业务逻辑、路由、AuthContext、其它页面完全不动。
