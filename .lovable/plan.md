## 目标

在 AI 综合评分结果中，单独列出"薄弱指标项"，便于企业填报者针对性补充证明材料或加入节能技术；同时确保 AI 打分结果在企业侧和政府侧都可见。

## 一、AIScoringAgentPanel 增加「薄弱指标提醒」

文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`

在 `finished` 后的最终结果卡片（L431-496）下方新增一个「薄弱指标提醒」分区：

- 数据来源：复用 `src/components/green-mfg/data.ts` 中的 `SCORE_DIMENSIONS`，遍历所有二级指标（`children`），筛选 `weight > 0 && score/weight < 0.9`（得分率低于 90%）的项作为"薄弱项"。
- 按薄弱程度（得分率升序）排序，列出 3-6 个最薄弱的二级指标，每张卡片显示：
  - 一级指标 › 二级指标名称
  - 当前得分 / 权重 + 失分（如 `7 / 8（失分 1 分）`）
  - 一条进度条（warning 配色）
  - 简短提升建议，按指标类型给出文案，如：
    - 能耗类 → "建议补充能源审计报告、节能改造方案"
    - 碳排放类 → "建议加入光伏/绿电采购证明，更新碳核查报告"
    - 资源/水类 → "建议补充中水回用、节水设备运行记录"
    - 固废/污染 → "建议补充污染物在线监测、固废综合利用台账"
    - 绿色产品/设计 → "建议上传绿色设计自评、产品碳足迹核算报告"
    - 默认 → "建议补充对应证明材料或节能技术应用情况"
  - 右侧一个次要按钮"补充证明材料"（仅 UI，点击 toast 提示）
- 顶部标题："薄弱指标提醒"，附 `AlertTriangle` 图标 + 计数 Badge；若无薄弱项则展示一行成功态："所有指标均达到良好水平"。
- 视觉沿用现有 `panel` 卡片 + warning 语义色（`border-warning/40 bg-warning/10 text-warning`），不引入新颜色。

## 二、AI 打分结果在企业侧和政府侧详情页可见

当前 `AIScoringAgentPanel` 仅在 `GreenMfgEntDeclarationNew.tsx` / `GreenMfgEntReviewNew.tsx`（填报态）出现，详情页未展示。

新增展示位置（直接复用同一个 `AIScoringAgentPanel` 组件，启动后即为"完成"态，含薄弱指标提醒）：

1. `src/pages/GreenMfgEntDeclarationDetail.tsx`：
   - `TABS` 数组新增一项 `{ value: "ai-scoring", label: "AI 打分结果" }`，插入在合适位置（建议在「评分明细」/最后一项之前）。
   - 增加对应 `<TabsContent value="ai-scoring">` 渲染 `<AIScoringAgentPanel />`。

2. `src/pages/GreenMfgGovDeclarationDetail.tsx`：
   - 同上，在 `TABS` 增加 `AI 打分结果` 项并渲染 `<AIScoringAgentPanel />`。

不改动业务数据、路由或其他流程，仅 UI/展示层调整。
