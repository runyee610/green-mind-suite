
## 变更目标

1. **市级详情页**：市级视角下点击"推荐"→按钮变为"取消推荐"（含义=已推荐到国家），外部列表推荐状态同步为"已推荐到国家"。
2. **市级列表**：除"审核中"（区级刚推荐上来的）只显示"确认/退回"外，其余"未推荐"记录都出现"推荐"按钮。
3. **市级"退回"按钮**颜色重新调整，去掉刺眼的红色。

---

## 详细方案

### 1. 详情页区分角色 + 与列表状态联动

**问题**：详情页 `GreenMfgGovDeclarationDetail.tsx` 目前只有一个 `recommended` 本地状态，既不区分区/市视角，也不会同步到列表页的 `pendingCityIds / cityConfirmedIds / nationalRecommendedIds` 状态。

**做法**：
- 将列表中的四个 ID 集合（`pendingCityIds` / `cityConfirmedIds` / `nationalRecommendedIds` / `unrecommendedIds`）改为通过 `localStorage` 持久化的共享存储（key 例如 `green-mfg-review-state`），列表页和详情页都读写同一份数据。
- 列表页跳转详情时在 URL 上带 `?view=city|district`（沿用当前 `expertView`），详情页据此判断当前是哪种角色。
- 详情页按视角渲染按钮：
  - **区级视角** `?view=district`：保持现状 —— "推荐"→"审核中"（一次性）。
  - **市级视角** `?view=city`：
    - 若当前状态为"未推荐"：按钮显示"推荐"，点击后加入 `nationalRecommendedIds`（同步 `cityConfirmedIds`），状态变为"已推荐到国家"，按钮切换为"取消推荐"。
    - 若当前状态为"已推荐到国家"：按钮显示"取消推荐"（success 描边样式），点击后从 `nationalRecommendedIds` 移除，回到"未推荐"。
    - 若当前状态为"审核中"：按钮显示"确认"与"退回"（与列表一致）。

### 2. 市级列表推荐按钮规则调整

在 `src/pages/GreenMfgGov.tsx` 表格操作列：
- 移除现在 `expertView === "city" && status === "未推荐" && cityApproved` 里的 `cityApproved` 限制，改为：市级视角下所有 `status === "未推荐"` 都渲染"推荐"按钮，点击直接调用 `handleRecommendNational`（直达"已推荐到国家"）。
- "审核中"仍然只显示"确认/退回"，不显示"推荐"。
- "已推荐到国家"仍然显示"取消推荐"。

### 3. "退回"按钮配色

当前 `border-destructive/40 text-destructive hover:bg-destructive/10`（红色）改为中性偏灰的次要样式：
- 使用 `border-border text-muted-foreground hover:bg-muted hover:text-foreground`（灰底描边，与"撤回"等中性操作观感一致，且不与"确认"的主色冲突）。

---

## 涉及文件

- `src/pages/GreenMfgGov.tsx`
  - 四个 ID 集合改为读写 `localStorage`（用 `useEffect` 初始化 + 每次更新写回）
  - 列表跳转详情传 `?view=` 参数
  - 市级 未推荐 无条件显示"推荐"按钮
  - "退回"按钮换为中性灰色样式
- `src/pages/GreenMfgGovDeclarationDetail.tsx`
  - 读取 URL `view` 参数
  - 读取同一 localStorage 的状态并做写回
  - 按视角与当前状态渲染 推荐 / 取消推荐 / 确认+退回

---

## 交互效果小结

```text
区级详情：推荐 → 审核中（不可撤回自身，需在列表撤回）
市级详情（未推荐）：推荐 → 已推荐到国家 → 按钮变"取消推荐"
市级详情（审核中）：显示 确认 / 退回
市级列表：审核中 → 确认/退回；未推荐 → 推荐；已推荐到国家 → 取消推荐
```
