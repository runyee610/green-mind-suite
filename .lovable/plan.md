## AI 打分结果 — 生成中过渡页

在进入第 4 步"AI 打分结果"时，先展示一段"AI 正在生成建议"的过渡加载态，模拟几分钟的分析过程后再展示现有的评分结果面板。

### 交互流程

```text
第 3 步 基本信息 → 点击"下一步" → 第 4 步 AI 打分结果
                                    ├─ 进入即显示 "生成中" 过渡页（约 8 秒模拟）
                                    │   - 顶部机器人图标 + 脉冲光环
                                    │   - 标题："AI 智能体正在分析..."
                                    │   - 副标题："请稍等几分钟，AI 正在综合评分并生成节能技改建议"
                                    │   - 4 步进度清单，依次点亮：
                                    │       1. 解析证明材料 & 填报数据
                                    │       2. 匹配指标评分模型
                                    │       3. 识别薄弱项 & 生成技改建议
                                    │       4. 汇总综合评分
                                    │   - 底部整体进度条（0→100%）
                                    │   - 提示 "已用时 xxs / 预计 ~8s"
                                    │   - "在后台生成，先返回填报"按钮（可选，返回上一步）
                                    └─ 完成后自动淡出，渲染现有 AI 打分结果面板
```

首次到达该步骤才播放动画；同一次会话内再次切回本步骤直接显示结果，不再重播（可用 `sessionStorage` 记录 `ai-scoring-generated` 标记，或组件内 state）。用户手动点击"重新 AI 打分"（未来若接入）会重置状态、再次播放。

### 涉及文件

- 新增 `src/components/green-mfg/AIScoringGeneratingOverlay.tsx`
  - Props：`onComplete: () => void`、`durationMs?: number`（默认 8000）。
  - 使用 `setInterval` 推进进度（每 ~120ms 更新一次），到 100% 触发 `onComplete`。
  - 视觉：沿用现有 `AIScoringAgentPanel` 的科技感风格（`bg-gradient-primary`、`primary/cyan` 光晕、grid mask 背景），保持视觉一致。
  - 使用语义 token（`primary`、`muted-foreground`、`warning`、`success`），无硬编码色。
  - 图标：`Bot / Sparkles / Loader2 / CheckCircle2 / FileSearch / Gauge / Lightbulb / ClipboardCheck`（lucide-react）。
- 修改 `src/components/green-mfg/AIScoringAgentPanel.tsx`
  - 新增内部 state `generated`（默认 `false`，读取 `sessionStorage`）。
  - 未生成时渲染 `<AIScoringGeneratingOverlay onComplete={...} />`；完成后 `setGenerated(true)` 并写入 sessionStorage，展示原有评分卡片。
- 无需改路由；`GreenMfgEntDeclarationNew.tsx` 的第 4 步入口保持不变。

### 技术要点

- 不引入定时后端请求，纯前端模拟（当前项目该模块无真实 AI 后端）。
- 进度分为 4 段各 25%，每段结束时把对应步骤标为"已完成"（`CheckCircle2` 变绿），当前步骤显示旋转 `Loader2`。
- 组件卸载时清理定时器，避免内存泄漏。
- 保持 `id="ai-scoring"` 与 `scroll-mt-24`，锚点行为不变。
- 动效：`animate-fade-in`、`animate-pulse-glow`（已在项目 tailwind config 中定义）；进度条用现有 `Progress`（无宽度过渡时手写 `transition-[width] duration-300`）。

### 验收

- 首次进入第 4 步：看到"AI 正在生成建议，请稍等…"过渡页，进度条与步骤依次点亮，约 8 秒后自动切换为评分结果。
- 切到其他步骤再切回：直接显示评分结果，不重播。
- 视觉与现有绿色/青色科技风一致，暗色/亮色模式均可读。