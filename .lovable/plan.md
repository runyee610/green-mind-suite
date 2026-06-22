## 目标
在政府侧「专家评审」页面（`/green-mfg/gov/review`，对应 `GreenMfgGov.tsx`）增加多项功能调整，并让其详情页与企业模拟评价详情页保持一致，同时新增「加入培育库」操作。

## 变更点

### 1. 状态下拉随专家视角切换（`src/pages/GreenMfgGov.tsx`）
- 区级专家视角：「全部状态」下拉项为 `待推荐`、`已推荐到市级`
- 市级专家视角：「全部状态」下拉项为 `待推荐`、`已推荐到国家`
- 内部 `getDerivedStatus` 派生状态语义对应调整：
  - 区级：`待推荐` / `已推荐到市级`
  - 市级：`待推荐` / `已推荐到国家`
- KPI 卡片「待推荐 / 已推荐」标签同步使用上述新文案（按当前视角显示）。
- 列表「推荐状态」列、操作列按钮 disabled 判断使用新派生状态。
- `handleRecommend` toast 文案保持「已推荐至市级 / 已推荐认定（国家）」语义，与新状态语义对齐。
- 切换视角时重置 `stageFilter` 为 `all`，避免出现旧值。

### 2. 顶部新增「导入」按钮
- 在「推荐列表」`CardHeader` 右侧操作区（搜索/筛选所在的 `flex-wrap`）首位新增一个 `导入` 按钮（`Upload` 图标，`variant="outline"`、`size="sm"`、`h-8`）。
- 仅做 UI 占位：点击 toast 提示「导入功能开发中」，与项目现有 mock 风格一致。

### 3. 详情页与企业模拟评价详情页保持一致（`src/pages/GreenMfgGovDeclarationDetail.tsx`）
- 重构为与企业侧详情页（`GreenMfgEntDeclarationDetail` 中使用的 `StepTabs` + `DeclarationDetailSections` 组合）一致：
  - 改用 `DeclarationStepTabs`（`StepTabs` + `DECLARATION_ANCHORS`），四个标签：基本要求、评价指标表、基本信息、AI 打分结果。
  - 复用 `BasicRequirementsCard`、`EvaluationIndicatorCard`（`mode="gov"`，保留打分交互）、`EnterpriseBasicInfoCard`、`AIScoringAgentPanel`。
  - 顶部副标题、企业名称、信用代码、行业、批次、提交时间展示方式与企业侧详情头部对齐。

### 4. 详情页操作区按钮调整
- 在原「推荐」按钮**前面**新增「加入培育库」按钮：
  - `Sprout` 图标，`variant="outline"`、`size="sm"`，文案「加入培育库」。
  - 点击 toast `已加入培育库`，本地 state `addedToIncubator` 切换为 `已加入培育库（点击移除）`，与现有「推荐」按钮交互风格一致。
- 「推荐」按钮逻辑保留。
- `isIncubator` 分支（梯度培育入口跳转过来时）继续隐藏推荐按钮；「加入培育库」按钮也在该分支隐藏。

## 影响文件
- `src/pages/GreenMfgGov.tsx`：状态下拉项、KPI 文案、派生状态、导入按钮、切换视角时重置筛选。
- `src/pages/GreenMfgGovDeclarationDetail.tsx`：详情页结构改为与企业侧一致，新增「加入培育库」按钮。
- 不修改 `DeclarationDetailSections` / `DeclarationStepTabs` 等组件本身，仅作为消费方使用。
- 不涉及路由、数据 schema 变更。

## 验证
- 切换区级 / 市级专家：下拉项分别为「待推荐 / 已推荐到市级」「待推荐 / 已推荐到国家」，列表状态徽标与 KPI 文案同步。
- 列表顶部「导入」按钮可见、可点击并 toast 提示。
- 详情页四个标签页与企业模拟评价详情页结构一致；操作区出现「加入培育库」「推荐」「返回列表」三个按钮（梯度培育入口下仅显示「返回列表」）。
