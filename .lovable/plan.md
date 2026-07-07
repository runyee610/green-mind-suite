
## 需求

1. 政府端（区/市管理员）专家评审列表：**移除"AI打分"**，只保留"区得分"和"市得分"两列。
2. 三段推荐流程：
   - **区级推荐** → 状态变为 **"审核中"**（不再直接跳到"已推荐到市级"）
   - 该数据出现在**市级管理员列表**里，操作列显示 **"确认" + "退回"** 两个按钮
   - 市级点 **"确认"** → 状态变为 **"已推荐到国家"**（终态，不再可退回）
   - 市级点 **"退回"** → 状态回退到 **"未推荐"**（回到区级）
   - 已推荐到国家的记录不再显示"确认/退回"按钮

## 改动清单（只改前端展示与本地状态）

### 1. `src/pages/GreenMfgGov.tsx` — 列表

**状态模型（关键）**  
将现有 `recommendedIds`（区级已推荐→市级）语义整体重命名为**审核中集合** `pendingCityIds`。市级"确认"从 `pendingCityIds` 移出并加入 `nationalRecommendedIds`。市级"退回"从 `pendingCityIds` 移出并加入 `unrecommendedIds`（覆盖 mock 的"培育中/已完成"派生已推荐）。

派生状态改为四态：`"未推荐" | "审核中" | "已推荐到国家" | ...`（保留兼容显示）。
- `getDerivedStatus`：
  - 若 `nationalRecommendedIds.has(id)` → `已推荐到国家`
  - 否则若"区级已推荐"（`pendingCityIds` 或 mock 派生的"培育中/已完成"未被 unrecommend） → `审核中`
  - 否则 → `未推荐`

**列表列**  
- 删除 `AI打分/区得分` 表头 + 单元格，仅保留：`区得分`（`r.manualScore ?? "—"`）+（市级视角）`市得分`（`r.cityScore ?? "—"`）
- Badge 配色：`未推荐` → warning；`审核中` → info；`已推荐到国家` → success
- `recommendedLabel` / 顶部 KPI"已推荐到市级/国家" 卡片相应更新：区级视角显示"审核中"计数，市级视角显示"已推荐到国家"计数

**操作列**  
- 区级视角：
  - `未推荐` → 显示 `推荐` 按钮（primary），点击进入"审核中"
  - `审核中` → 显示 `已推荐（审核中）` 只读 outline 徽章样式按钮 disabled，或允许"取消推荐"回退（保留现有 `handleCancelDistrict` 逻辑，只作用于 pending 状态，不影响国家态）— 保留取消，方便演示
  - `已推荐到国家` → 不显示按钮
- 市级视角：
  - `审核中` → 显示 `确认`（primary，绿色）+ `退回`（outline，红字）两个按钮
  - `已推荐到国家` → 不显示按钮，仅展示状态徽章
- `toggleByDerived` 拆分为 `handleConfirmCity` / `handleReturnCity` / 保留区级 handler

**筛选下拉**  
`状态` 选项由 `未推荐 / 已推荐到市级` 改为 `未推荐 / 审核中 / 已推荐到国家`（按视角显示相关项）。

**市级列表可见性**  
`declarations` 过滤里，市级视角只看到 `审核中` + `已推荐到国家` 的记录（即当前有过任何推荐动作的），保留现有 `isDistrictRecommended` 判断逻辑（rename → `isSubmittedToCity`）。

### 2. `src/pages/GreenMfgGovDeclarationDetail.tsx` — 详情页
- 保留"推荐"按钮，但仅在能确定当前视角时生效。因为详情页无 role 区分，把 `handleToggleRecommend` 语义改为**区级推荐**：点击后 `recommended=true`，按钮文案变为 `已推荐（审核中）` + disabled（终止交互，市级审核走列表）。取消推荐移除（避免与列表市级流冲突，模拟一次性提交）。
- 文案与图标：由 `Star` 保留。

### 3. 无需改动
- `src/pages/GreenMfgEnt*.tsx`、`GreenMfgAgent`、数据 mock、路由

## 验证
- 区级视角：`未推荐` 记录 → 点"推荐" → 变 `审核中`，KPI"审核中"+1
- 切到市级视角：能看到该记录，操作列显示"确认 / 退回"
- 点"确认" → 状态 `已推荐到国家`，按钮消失
- 再切回区级：该记录状态显示 `已推荐到国家`，不再显示操作按钮
- 另一记录点"退回" → 回到 `未推荐`，区级列表可再次操作
- 表格再无"AI打分/区得分"列，只有"区得分"（区、市两视角）与"市得分"（市视角）
- 跑 tsgo 无回归
