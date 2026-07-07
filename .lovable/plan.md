
## 需求
区级推荐 → 市级点击"确认"后，区级列表里该条记录的推荐状态应显示为 **"已推荐到市级"**（当前显示为"未推荐"，不符合业务）。

## 状态机（更新后）
```text
未推荐  ──区级推荐──▶  审核中  ──市级确认──▶  已推荐到市级  ──市级推荐到国家──▶  已推荐到国家
                                              ▲                                    │
                                              └──────── 市级取消国家推荐 ──────────┘
市级"退回" / 区级"撤回"：审核中 / 已推荐到市级 → 未推荐
```

## 涉及改动

### 1. `src/components/green-mfg/reviewState.ts`
- `ReviewStatus` 增加成员：`"已推荐到市级"`。
- `deriveStatus` 新增判断：`cityConfirmedIds` 命中且不在 `nationalRecommendedIds` → `"已推荐到市级"`。
- 保持既有 mutation：`cityConfirm` 会把 id 从 `pendingCityIds` 移到 `cityConfirmedIds`，因此该状态会自然出现。

### 2. `src/pages/GreenMfgGov.tsx`
- 状态徽章颜色映射增加：`"已推荐到市级"` 使用主色调（如 `border-primary/40 bg-primary/10 text-primary`），区别于绿色的"已推荐到国家"和琥珀色的"审核中"。
- 状态筛选下拉框 `SelectContent` 增加 `SelectItem value="已推荐到市级"`（区级/市级视角都可见）。
- 市级视角"未推荐"按钮行为保持：`已推荐到市级` 本质上就是市级已确认待推国家，市级视角应当仍能点"推荐"（推荐到国家）；因此把当前 `expertView === "city" && status === "未推荐"` 的推荐按钮条件扩展为 `status === "未推荐" || status === "已推荐到市级"`。
- KPI 卡片文案维持现状（不新增卡片，避免拥挤）。

### 3. `src/pages/GreenMfgGovDeclarationDetail.tsx`
- 详情页按钮渲染中，`"已推荐到市级"` 在市级视角下渲染"推荐"按钮（可直达"已推荐到国家"），在区级视角下渲染禁用态的"已推荐到市级"提示徽章按钮（primary 色系，与列表徽章一致）。

## 不改动
- 数据模型 / 路由 / 后端。
- 市级"退回"仍回到"未推荐"（区级）；取消国家推荐仍回到"已推荐到市级"。

改动纯前端、纯展示与筛选，不影响审批链路本身。
