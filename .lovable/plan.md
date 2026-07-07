## 目标
让"推荐状态"根据当前查看的层级（区级 / 市级）显示不同含义，与用户表述一致：

| 数据实际状态 | 区级列表显示 | 市级列表显示 |
|---|---|---|
| 区级点击"推荐"后 | 审核中 | 审核中 |
| 市级点击"确认"后 | 已推荐到市级 | 未推荐 |
| 市级点击"推荐"（到国家）后 | 已推荐到国家 | 已推荐到国家 |

即：市级视角下，"cityConfirmed 但未推荐到国家"应显示为"未推荐"（因为对市级来说，"推荐"是指推荐到国家）。

## 修改内容

### 1. `src/components/green-mfg/reviewState.ts`
- 给 `deriveStatus` 增加可选参数 `viewer: "district" | "city"`（默认 `"district"`）。
- 逻辑：
  - `nationalRecommendedIds` → `已推荐到国家`
  - `pendingCityIds` → `审核中`
  - `cityConfirmedIds`：
    - `viewer === "city"` → `未推荐`
    - 否则 → `已推荐到市级`
  - 其他 → `未推荐`

### 2. `src/pages/GreenMfgGov.tsx`
- `getDerivedStatus` 改为传入当前视角：`deriveStatus(id, reviewState, expertView === "city" ? "city" : "district")`。
- 其他逻辑不动：市级列表现在对 cityConfirmed 记录会显示"未推荐"，因此"未推荐/已推荐到市级都显示推荐按钮"的现有条件依旧能让该行出现"推荐"按钮，效果符合预期（点击后进入 `已推荐到国家`）。
- 状态筛选下拉、KPI 卡片保持原样即可（选择"未推荐"时可同时命中市级视角下 cityConfirmed 的记录，这与市级视角的语义一致）。

### 3. `src/pages/GreenMfgGovDeclarationDetail.tsx`
- 详情页同样按访问角色渲染。当前详情页调用 `deriveStatus(detail.id, reviewState)`，改为根据 `expertView`（组件内已有）传入 viewer 参数，使市级详情页在 cityConfirmed 状态下按钮呈现为"推荐"（点击 → 推荐到国家），而不是"已推荐到市级"。区级详情页保持显示"已推荐到市级"。

## 技术备注
- 只改前端展示派生逻辑，不改底层存储结构（`cityConfirmedIds` 仍然是唯一真相源）。
- 不影响"退回 / 撤回 / 取消国家推荐"等已有 mutation。
