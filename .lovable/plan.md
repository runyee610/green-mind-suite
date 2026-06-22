## 目标
将政府侧「企业模拟评价」详情页（`/green-mfg/gov/self-assess/:creditCode`）的展示结构与企业侧「模拟自我评价」详情页对齐，并确保所有内容只读、没有任何可交互操作。

## 现状
- 企业侧详情页 `GreenMfgEntDeclarationDetail.tsx` 使用 `StepTabs` + `DeclarationDetailSections` 展示：基本要求、评价指标表、基本信息、AI 打分结果，含编辑和上下步操作。
- 政府侧当前详情页 `GreenMfgGovSelfAssessDetail.tsx` 仅展示企业信息卡、评价摘要 KPI、一级指标维度得分、薄弱项清单，没有完整评价表单内容。
- `DeclarationDetailSections` 中的 `EnterpriseBasicInfoCard`、`BasicRequirementsCard`、`EvaluationIndicatorCard` 均支持 `editable={false}` / 不传 `onChange` 的只读模式。

## 实施方案

### 1. 重构页面结构
修改 `src/pages/GreenMfgGovSelfAssessDetail.tsx`：
- 保留「取该企业最新一次评价」的逻辑。
- 移除当前的企业信息卡、KPI 摘要卡、维度得分卡、薄弱项清单卡（这些摘要信息后续可在基本信息/评价指标表中自然透出，不再单独展示）。
- 改为与企业侧一致的 `StepTabs` 四标签布局：
  - 基本要求
  - 评价指标表
  - 基本信息
  - AI 打分结果

### 2. 只读复用现有组件
引用 `DeclarationDetailSections` 中的卡片：
- `EnterpriseBasicInfoCard` — 不传 `onChange`，使用只读展示。
- `BasicRequirementsCard` — 不传 `onChange`，使用只读展示。
- `EvaluationIndicatorCard` — `mode="gov"`，`editable={false}`，不传 `onChange`。
- `AIScoringAgentPanel` — 直接复用 AI 打分结果面板。

### 3. 数据关联
- 通过 `creditCode` 在 `MOCK_DECLARATIONS` 中匹配对应的申报记录。
- 命中时：使用对应企业的 `batch`、`submitDate`、`industry`、`outputValue` 等信息回填页面标题/副标题，并让各详情卡片按该企业上下文展示。
- 未命中时（如演示企业上海华普电缆有限公司在政府侧申报库中暂无记录）：回退到 `DeclarationDetailSections` 内置的默认模拟数据，仍然保证页面可正常渲染。
- 仍只展示该企业最新一次自评价结果；若有多条记录，按日期取最大日期的一条。

### 4. 移除所有操作
- 移除「推荐/取消推荐」等政府侧操作按钮。
- 移除企业侧的「上一步 / 下一步」导航。
- 只保留一个「返回列表」按钮，跳回 `/green-mfg/gov/self-assess`。
- 页面标题格式：`企业模拟评价 · {enterpriseName}`；副标题：`仅展示该企业最新一次 AI 模拟自我评价结果（只读）`。

### 5. 验证
- 确保 `tsc --noEmit` 无类型错误。
- 在政府侧「企业模拟评价」列表点击任意企业「详情」，确认页面只展示四个只读标签页，无输入框可编辑、无推荐/提交/导航按钮。

## 影响文件
- `src/pages/GreenMfgGovSelfAssessDetail.tsx`（主要修改）
- `src/components/green-mfg/DeclarationDetailSections.tsx` 及相关卡片组件（无需改动，已支持只读模式，仅调用方式变更）
- 不涉及路由、菜单、数据类型新增