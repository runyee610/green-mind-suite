## 目标
政府侧区级专家 / 市级专家进入"评价指标表"时，与企业侧一样支持 **AI 一键打分**（含进度统计、AI 概览提示、重新打分二次确认）。

## 改动范围
仅前端 UI 条件控制，**1 个文件**：

`src/components/green-mfg/DeclarationDetailSections.tsx`

把 `EvaluationIndicatorCard` 内三处仅在企业模式 (`entEditable`) 显示 AI 相关 UI 的条件，改为同时允许政府模式 (`entEditable || govEditable`)：

1. **L1008** —— 顶部「AI 一键打分 / 重新 AI 打分」按钮
2. **L1027** —— 按钮旁的「上次打分 · HH:MM」时间戳
3. **L1071** —— AI 打分完成后的概览提示卡（已填 / 薄弱项 / Top 建议）

`handleAIClick` / `runAI` / `confirmOpen` / `aiOverview` 等逻辑已经在组件作用域内，无需新增 state；`runAIScoring` 工具已存在，复用即可。

## 不变更
- 企业侧体验保持不变。
- 政府侧详情页 `GreenMfgGovDeclarationDetail.tsx` 已经以 `mode="gov"` 传入，无需改动。
- 评分计算、AI 引擎、数据结构、路由、其它 tab 均不动。

## 验证
- 切到「政府 → 区级专家 / 市级专家 → 进入某条申报 → 评价指标表」tab，能看到「AI 一键打分」按钮并可触发；已有评分时按钮变为「重新 AI 打分」并弹出二次确认；执行后顶部出现 AI 概览卡。
- 企业侧路径下行为不变。
- TypeScript 编译通过。