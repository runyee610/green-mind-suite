## 1. AI 打分结果右上角"完成"按钮跳回列表页

文件：`src/pages/GreenMfgEntDeclarationNew.tsx`

- 顶部操作栏（约第 175-178 行）当前"完成/保存"按钮统一调用 `handleSave`。
- 调整：在 `ai-scoring` 步骤时，按钮文案保持"完成"，但点击改为先 `handleSave()` 再 `navigate("/green-mfg/ent")`；其他步骤维持"保存"草稿行为。

## 2. "模拟自我评价"列表调整

文件：`src/pages/GreenMfgEnt.tsx`

修改 `MOCK_SELF_ASSESS` 数据结构与表格列：

- 数据：
  - 移除 `attested` 字段及相关逻辑。
  - 增加 `enterpriseName`（公司名称，默认全部使用当前登录企业「上海华普电缆有限公司」）。
  - 增加 `indicatorCount`（指标数，示例值 23）。
- 表头（第 109-116 行）调整为：公司名称 / AI 智能打分 / 指标数 / 备注 / 评估日期 / 操作。
- 表体（第 117-139 行）：
  - 新增「公司名称」列。
  - AI 智能打分单元格中删除"已确权"`Badge`。
  - 新增「指标数」列，显示 `indicatorCount`。
  - 顶部 `Field` 概览卡保持不变。
- 同步移除文件顶部未再使用的 `CheckCircle2` 在该 Badge 处的引用（其他位置仍需保留则不动）。

## 3. "查看"页面与"新建评价"详情页对齐，去掉 3 张统计卡

目标：点击"查看"后，页面布局/Tab 结构与 `GreenMfgEntDeclarationNew` 一致（基本要求 / 评价指标表 / 基本信息 / AI 打分结果 四步 Tab），并去掉「当前状态」「智能打分」「专家审核」三张统计卡。

文件：`src/pages/GreenMfgEntDeclarationDetail.tsx`

- 删除第 73-140 行的统计卡区块（含当前状态 / 智能打分 / 专家审核三张 `Card` 与"最新审核意见"块保留与否：保留审核意见，仅删 3 张统计卡）。
- 将原 `TABS` 改为与 `ANCHORS` 一致的 4 项：基本要求 / 评价指标表 / 基本信息 / AI 打分结果，并使用与 New 页相同的 `StepTabs` 视觉（带数字步骤的标签）。
  - 抽取 `StepTabs` 与 `ANCHORS` 到 `src/components/green-mfg/DeclarationStepTabs.tsx` 共享文件，供 New 与 Detail 页共用，避免重复定义。
- Tab 内容渲染：
  - 基本要求 → `<BasicRequirementsCard data={...} />`（只读，不传 `editable`）。
  - 评价指标表 → `<EvaluationIndicatorCard data={...} mode="ent" showGovRemark={false} />`（只读）。
  - 基本信息 → `<EnterpriseBasicInfoCard data={...} />`（只读）。
  - AI 打分结果 → `<AIScoringAgentPanel />`。
- 数据来源：在查看模式下尝试从 `localStorage` 的 `green-mfg-ent-declaration-draft` 读取草稿；若不存在则使用空模板（`EMPTY_ENTERPRISE_BASIC` / `buildEmptyBasicRequirements()` / `buildEmptyIndicators()`）。
- 底部「上一步 / 下一步」与 New 页相同；顶部右侧仅保留「返回」按钮（不含保存/完成）。
- 移除已不再使用的 `Sparkles`、`UserCheck`、`Progress`、`stageBadgeClass`、`MOCK_AUDIT_FLOW`、`ScoreBreakdown` 等引用。

## 影响范围

- `src/pages/GreenMfgEnt.tsx`：自评价列表列调整。
- `src/pages/GreenMfgEntDeclarationNew.tsx`：完成按钮跳转 + 引用共享 StepTabs。
- `src/pages/GreenMfgEntDeclarationDetail.tsx`：重构为 4 步 Tab 只读视图，删除统计卡。
- 新增 `src/components/green-mfg/DeclarationStepTabs.tsx`：共享步骤 Tab 组件与 ANCHORS 常量。
