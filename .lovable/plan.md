
## 需求解读

现有三态：`未推荐 / 审核中 / 已推荐到国家`。用户要求改为四态流程，并把"确认"与"推荐到国家"解耦为两步：

| 步骤 | 视角 | 动作 | 状态变化 |
|---|---|---|---|
| 1 | 区级 | 点"推荐" | `未推荐` → `审核中` |
| 2 | 市级 | 点"退回" | `审核中` → `未推荐`（回到区级） |
| 3 | 市级 | 点"确认" | `审核中` → `未推荐`（通过市级审核，但尚未推到国家；即"未推荐（到国家）"） |
| 4 | 市级 | 对已通过审核的行点"推荐" | `未推荐` → `已推荐到国家`，按钮变 `取消推荐` |
| 5 | 市级 | 点"取消推荐" | `已推荐到国家` → `未推荐`（保留市级确认态） |

同时把"审核中"徽章/按钮的蓝色改成更柔和的色系（琥珀 warning），避免突兀。

## 数据模型

在 `GreenMfgGov.tsx` 新增一个集合：
- `cityConfirmedIds: Set<string>` —— 市级已确认（通过审核）的记录 id

组合逻辑：
- `已推荐到国家` = `nationalRecommendedIds.has(id)`
- `审核中` = `pendingCityIds.has(id)` && !`已推荐到国家`
- `未推荐` = 其它。**注意**：`cityConfirmedIds` 仍显示为"未推荐"（对外文案一致），仅在市级操作列用于决定"推荐 / 取消推荐"按钮是否可用。

事件：
- `handleRecommendDistrict(id)`：`pendingCityIds.add(id)`，从 `unrecommendedIds` 移除
- `handleCancelDistrict(id)`：区级撤回审核中 → `pendingCityIds.delete`，`unrecommendedIds.add`
- `handleConfirmCity(id)`：`pendingCityIds.delete`，`cityConfirmedIds.add`
- `handleReturnCity(id)`：`pendingCityIds.delete`，`unrecommendedIds.add`，`cityConfirmedIds.delete`
- `handleRecommendNational(id)`：`nationalRecommendedIds.add`（要求 `cityConfirmedIds.has(id)`）
- `handleCancelNational(id)`：`nationalRecommendedIds.delete`（回到 `cityConfirmedIds` 内的"未推荐"）

## 市级列表可见性

`isSubmittedToCity` 扩展为：`pendingCityIds || cityConfirmedIds || nationalRecommendedIds || (mock 派生"培育中/已完成"且未被 unrecommend)`。已被市级"退回"的记录（`unrecommendedIds`）不再出现在市级列表。

## 市级操作列（按 status + `cityConfirmedIds` 判断）

- `审核中` → `确认`（primary）+ `退回`（destructive outline）
- `未推荐` 且 `cityConfirmedIds.has(id)` → `推荐`（primary，图标 Star）
- `已推荐到国家` → `取消推荐`（success outline）
- `未推荐` 且未通过审核（罕见：市级视角不会显示这类，因为 `isSubmittedToCity` 过滤）→ 无按钮

## 区级操作列（保持不变）

- `未推荐` → `推荐`
- `审核中` → `撤回`（warning outline）
- `已推荐到国家` → 无按钮（保留详情）

## 颜色调整

- `审核中` 徽章配色：`border-info/... text-info` → 改为 `border-warning/40 bg-warning/10 text-warning`（琥珀）
- 区级"撤回"按钮相应配套（已是 warning）
- 详情页"推荐"按钮的"审核中"占位样式（`GreenMfgGovDeclarationDetail.tsx`）从 info 改为 warning

## KPI 卡片

- 区级视角保持"审核中"
- 市级视角：`已推荐到国家` 计数不变。第二个 KPI"审核中"仍显示"审核中"（市级也关心）；可以再新增一列"待推荐（已审核）" = `cityConfirmedIds && !nationalRecommendedIds` 的数量。为了不改布局，改为 3 列展示：`企业总数 / 审核中 / 已推荐到国家`（市级视角），本次不再新增卡片。

## 改动文件

- `src/pages/GreenMfgGov.tsx`：state + handlers + 操作列 + Badge 颜色 + 过滤器
- `src/pages/GreenMfgGovDeclarationDetail.tsx`：审核中态样式改 warning

## 验证

- 区级推荐 → 审核中（琥珀徽章）
- 切市级 → 出现该记录，"确认"/"退回" 按钮
- 点"确认" → 徽章变"未推荐"（灰/orange warning 与之前一致），操作列出现"推荐"按钮
- 点"推荐" → 徽章"已推荐到国家"（绿），按钮变"取消推荐"
- 点"取消推荐" → 徽章回"未推荐"，按钮回"推荐"
- 市级"退回" → 记录从市级列表消失；回到区级视角显示"未推荐"
- 跑 tsgo 无回归
