# 政府侧梯度培育界面精简

仅改两个文件，不涉及数据 / 企业侧。

## 1. `src/pages/GreenMfgGovIncubator.tsx`

**去掉「晋升培育」**
- 移除表头第一列「选择」Checkbox 和每行的选择 Checkbox，移除全选逻辑（`selected` / `toggleSelect` / `toggleSelectAll` / `allDistrictSelected` / `selectedDistrictRows`）。
- 移除「晋升培育」按钮、`promoteConfirmOpen` 状态、`handlePromote`、底部「晋升培育二次确认」AlertDialog。
- 移除 `ArrowUpCircle` 引入；表格 colSpan 由 9 改为 8；移除卡片标题旁「已选 X 家」提示。
- 切换视角时不再 `setSelected(new Set())`。

**去掉「入库登记」卡片**
- KPI 网格从 7 张减为 6 张（`md:grid-cols-4 xl:grid-cols-6`），删除「入库登记」KpiCard 及 `scopeEnterCount` 计算。

**去掉导入**
- 移除「导入」按钮、`importOpen` / `importForm` 状态、`handleImportSubmit`、整个「导入对话框」Dialog。
- 移除 `Upload`、`Dialog*`、`Label`、`DISTRICTS` 等仅供导入用的引入；`setData` 改为只读的 `data = INITIAL_INCUBATE_DATA`（仍需支持退库，所以保留 `useState`）。

**去掉「全部阶段」筛选项**
- 移除工具栏中阶段 Select 控件，以及 `stageFilter` 状态。诊断调研/晋级出库 KPI 卡片改为非可点击（去掉 `onClick` / `active`），保留展示。
- `rows` 过滤逻辑移除 `stageFilter` 分支。

## 2. `src/pages/GreenMfgGovIncubatorDetail.tsx`

**政府侧只读展示 AI 调研结果**
- 已有 `loadResearch(creditCode)` + `incubator-research-updated` 监听，企业侧启动后政府侧会自动同步——保留该机制。
- 移除「重新调研」按钮和 `rerun` 函数；移除空态下的「立即启动调研」按钮，空态文案改为「该企业尚未启动 AI 调研，启动后此处将自动同步结果」。
- 移除 `runIncubatorResearch` 引入及 `RefreshCw`、`Sparkles`（若仅用于该按钮）等未用图标。
- 「改进建议」中 `!research` 文案同步改为：等待企业侧启动调研后自动生成。

## 不改动
- `INITIAL_INCUBATE_DATA`、企业侧 `GreenMfgEntIncubator.tsx`、`incubatorResearchData.ts`、路由配置。
