
## 目标

1. 主按钮（"开始评价"等）颜色与阴影严格对齐参考图：**纯色翠绿**（非渐变）、**较大圆角矩形**（≈14px，非胶囊 pill）、**柔和绿色投影**。
2. 顺手做一轮整体 UI 精修，达到"可交付给开发"的简约美观度：统一控件圆角、层级、边框、间距。仅调设计令牌与共享组件，不动业务逻辑。

## 参考图按钮特征

- 底色：单色明亮翠绿 ≈ #10B981（`hsl 160 84% 39%`），无渐变
- 圆角：约 14px（非全圆胶囊）
- 阴影：`0 10px 24px -8px rgba(16,185,129,.45)` 类型的柔和绿色投影
- 内部：白色字 + 白色 `+` 图标，字重 medium，字号 14px

## 改动清单

### 1. `src/components/ui/button.tsx`
- base class：`rounded-full` → `rounded-xl`（14px，对齐 --radius）
- `default` variant：去掉之前追加的重阴影表达式，改为使用 CSS 变量 `shadow-[var(--shadow-button)]` + hover `shadow-[var(--shadow-button-hover)]`；底色保持 `bg-primary`（纯色）
- `size.sm`：`h-9 px-3` 保持；`size.lg`：`h-11 px-8` 保持；圆角均继承 base

### 2. `src/index.css`
- 新增/调整令牌：
  - `--shadow-button: 0 10px 24px -8px hsl(160 84% 39% / 0.45), 0 4px 10px -4px hsl(160 84% 39% / 0.25)`
  - `--shadow-button-hover: 0 14px 30px -8px hsl(160 84% 39% / 0.55), 0 6px 14px -4px hsl(160 84% 39% / 0.3)`
- `--radius` 保持 `0.875rem`（14px）
- 把 `.panel` 的 `shadow-card` 稍微收敛为更柔的单层阴影，避免和圆角面板叠加过重
- 全站保留纯色主按钮为主；`.bg-gradient-primary` 保留供极少数强调场景（例如全景看板 KPI），不再作为主按钮默认底色

### 3. 全局微调（仅共享控件，不动业务页面）
- `src/components/ui/input.tsx` / `textarea.tsx` / `select.tsx`：确认已继承 `--radius`（若硬编码 `rounded-md` 则改为 `rounded-lg`），保持统一 14px 圆角家族
- `src/components/ui/card.tsx`：`rounded-lg` → `rounded-2xl`，边框透明度略降 `border-border/70`
- `src/components/ui/badge.tsx`：保持 `rounded-full`（tag/pill 语义）
- `src/components/ui/tabs.tsx`：TabsList `rounded-lg` → `rounded-xl`，TabsTrigger `rounded-sm` → `rounded-lg`
- `src/components/ui/dialog.tsx` / `sheet.tsx` / `popover.tsx` / `dropdown-menu.tsx`：内容器统一 `rounded-2xl`（原为 `rounded-lg`）

### 4. `src/components/AppLayout.tsx`
- header 与 main 之间已改为浮动圆角面板，本次仅：
  - main padding `p-6` → `p-8`（更透气）
  - h1 字号已是 28px，subtitle 增加 `mt-2`
  - 面包屑分隔符与项间距保持

## 不改的内容

- 业务页面组件、字段、文案、路由、交互
- 状态色（destructive/warning/info）
- 侧边栏配色（保持深绿墨）
- 全景看板 glass-card 组件

## 验证

- 跑 tsgo 确认无回归
- 目视对比：绿色制造模拟评价页的"开始评价"按钮与参考图形态一致；Dialog/Popover/Card 圆角家族统一；Dashboard、指标表页面无控件错位
