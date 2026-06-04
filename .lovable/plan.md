## 目标

政府侧详情页：
1. "AI 打分结果" 子界面默认直接展示**已完成态**（总分卡片 + 维度明细 + 薄弱指标提醒），同时顶部仍保留"启动 AI 打分"按钮，可点击重新跑一次。
2. 移除"智能打分"子界面。

## 一、`AIScoringAgentPanel` 增加预览态参数

文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`

- 新增可选 prop `initialFinished?: boolean`（默认 false，不影响企业侧已有用法）。
- 当 `initialFinished` 为 true 时，组件初始化：
  - `currentIdx` 设为 `STEPS.length`（进入 `finished` 态）
  - `tick` 初始化为 30，使分数动画直接定格在 91
  - `expanded` 默认全部展开，便于查看各阶段输出
  - 进度条显示 100%
  - 结果卡片 + `WeakIndicatorsPanel` 立即可见
- 顶部按钮逻辑微调：始终显示"启动 AI 打分"文案（覆盖原来 finished 后变成"重新运行"的分支）。点击后照常重置并重新跑动画，跑完仍回到完成态。"重置"按钮维持原行为。

仅展示层调整，不动数据/流程。

## 二、政府详情页移除"智能打分"，AI 打分结果使用预览态

文件：`src/pages/GreenMfgGovDeclarationDetail.tsx`

- 从 `TABS` 数组中删除 `{ value: "smart-score", label: "智能打分" }`。
- 删除对应的 `<TabsContent value="smart-score">` 整段（含智能打分卡片与专家审核卡片）。
- `<TabsContent value="ai-scoring">` 中 `<AIScoringAgentPanel />` 改为 `<AIScoringAgentPanel initialFinished />`。
- 其余 Tab、审批按钮、Dialog 等保持不变。

> 企业侧 `GreenMfgEntDeclarationDetail.tsx` / `GreenMfgEntDeclarationNew.tsx` / `GreenMfgEntReviewNew.tsx` 不传 `initialFinished`，行为保持现状。

## 技术细节

- `initialFinished` 仅影响初始 state，不影响 `start()/reset()`：点击"启动 AI 打分"仍会重置到第 0 步并按现有节奏推进。
- "专家审核"卡片随"智能打分" Tab 一并移除（政府详情页其它位置未引用）；如后续需要恢复，可再单独安置。
