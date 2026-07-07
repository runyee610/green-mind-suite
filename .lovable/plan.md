
## 目标

在已切换的翠绿色系基础上，继续对齐参考图的**造型语言**：更大圆角、深色侧边栏回归、字号层级、按钮阴影。仍然只调设计令牌与少量共享 class，不动业务组件结构。

## 改动清单

### 1. 圆角（radius）加大
`src/index.css`：
- `--radius: 0.5rem` → `--radius: 0.875rem`（14px，接近参考图卡片/输入框/tab pill 的圆角）
- `.panel` 由 `rounded-lg` 保持（继承新的 `--radius`），并将 header/main 内的大容器（如 tab 大 pill、主按钮）适配 `rounded-full`

### 2. 布局背景圆角处理
参考图中主内容区呈现为一个大圆角"面板"漂浮在浅绿背景上。仅改 `src/components/AppLayout.tsx`：
- 外层容器加内边距 `p-3`，`<main>` 包一层 `rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden`
- header 也改为浮于顶部的圆角条：`rounded-2xl` + `mx-3 mt-3` + 去除底部 border
- 不动 header 内部元素、面包屑、role switcher 逻辑

### 3. 侧边栏改回深色
`src/index.css` sidebar 令牌回滚为深色系（沿用旧值，但用绿调而非蓝调）：
- `--sidebar-background: 165 30% 10%`
- `--sidebar-foreground: 150 15% 78%`
- `--sidebar-primary: 158 70% 48%`
- `--sidebar-primary-foreground: 165 30% 10%`
- `--sidebar-accent: 165 25% 16%`
- `--sidebar-accent-foreground: 158 70% 65%`
- `--sidebar-border: 165 25% 18%`
- `--sidebar-ring: 158 70% 48%`

### 4. 按钮圆角 + 阴影
参考图主按钮为翠绿渐变胶囊 + 明显的绿色投影光晕。改 `src/index.css`：
- 新增全局工具：
  ```css
  --shadow-button: 0 8px 20px -6px hsl(160 84% 35% / 0.45),
                   0 2px 6px hsl(160 84% 35% / 0.25);
  ```
- 新增 `.btn-primary-glow` 组件 class（可选给渐变主按钮用），已存在的 `.bg-gradient-primary` 按钮通过在 `button.tsx` 的 default variant 上补 `shadow-[var(--shadow-button)]` + `rounded-full` 的方式统一

`src/components/ui/button.tsx`：
- 将 `buttonVariants` 的基础 class 中 `rounded-md` → `rounded-full`
- default variant 追加 `shadow-[0_8px_20px_-6px_hsl(var(--primary)/0.45)]`（保持 hover 更亮）

### 5. 字号层级对齐参考图
参考图观察：
- 页面主标题（如"模拟自评价"）≈ 28px 粗体
- 面包屑/次要说明 ≈ 12–13px
- 表头/卡片小标题 ≈ 13–14px
- 表体 ≈ 14px

改 `src/components/AppLayout.tsx`：
- `<h1>` 从 `text-2xl` → `text-[28px] leading-tight font-semibold`
- 面包屑从 `text-sm` → `text-[13px]`
- header 高度从 `h-14` → `h-14`（保持，只调子级字号）

其余页面文字规模已通过 tailwind 语义类保留，不逐个调整。

## 不改的内容

- 业务组件、页面结构、字段、文案、路由、交互逻辑
- 状态色（destructive / warning / info）
- 全景看板 glass-card / neon-text 组件

## 验证

跑 tsgo；目视对比 dashboard、绿色制造模拟评价列表、评价指标表页面：圆角、深色侧栏、主按钮胶囊+绿色投影、标题字号是否贴近参考图。
