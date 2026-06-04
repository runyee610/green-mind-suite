## 目标

1. "AI 打分结果"子界面顶部直接展示 **AI 综合评分结果 + 薄弱指标提醒** 两块内容；移除"智能体执行进度"进度条与"证明材料解析 / 结构化数据提取 / 公式计算与归一化 / 标杆对照 / 维度打分"五段步骤时间轴。Header 上的"启动 AI 打分 / 重置"按钮保留。
2. 政府侧详情页中"薄弱指标提醒"的「补充材料」按钮去掉（企业侧保留）。

## 实施

### 文件 `src/components/green-mfg/AIScoringAgentPanel.tsx`

- 给 `AIScoringAgentPanel` 增加可选 prop `hideSupplementButton?: boolean`（透传给 `WeakIndicatorsPanel`）。
- 复用现有 `initialFinished` 作为"精简结果视图"的开关（企业/政府详情页已在用）。当 `initialFinished` 为 true：
  - 不渲染"总体进度"卡片（带进度条、阶段计数、shimmer 动效的 `<div>`）。
  - 不渲染步骤时间轴 `<ol>`（5 个 STEP 卡片）。
  - 仍渲染最终结果卡片（91/100 + 5 维度）与 `<WeakIndicatorsPanel />`。
- `WeakIndicatorsPanel` 接收 `hideButton?: boolean`，为 true 时不渲染右上角的「补充材料」按钮。

> 影响：
> - 企业侧详情页 (`GreenMfgEntDeclarationDetail.tsx`) 也使用 `initialFinished`，进度条与步骤同样会被去掉（与需求一致：放到顶部直接展示结果）；该侧继续显示「补充材料」按钮。
> - 企业侧填报 / 复评页面 (`GreenMfgEntDeclarationNew.tsx`, `GreenMfgEntReviewNew.tsx`) 未传 `initialFinished`，依然展示完整的智能体执行流程，行为不变。

### 文件 `src/pages/GreenMfgGovDeclarationDetail.tsx`

- 将 `<AIScoringAgentPanel initialFinished />` 改为 `<AIScoringAgentPanel initialFinished hideSupplementButton />`。

不改业务数据、路由、其他流程。
