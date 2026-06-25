## 调整内容

### 1. 政府侧 - 专家评审企业详情页去掉"加入培育库"按钮
文件：`src/pages/GreenMfgGovDeclarationDetail.tsx`（区/市级专家共用此页）
- 移除右上角"加入培育库/退库"按钮（L66-73）
- 删除相关 state `addedToIncubator` 与 handler `handleToggleIncubator`
- 清理不再使用的 `Sprout` 图标 import 与 `toast` 中相关引用

### 2. 企业侧 - 模拟自评价界面去掉"加入培育库"按钮
文件：`src/pages/GreenMfgEnt.tsx`
- 移除自评价列表卡片右上角"加入培育库/已加入培育库"按钮（L92-110）
- 清理相关 state（`joined`）、`runIncubatorResearch` 调用、及不再使用的 `Sprout` / `CheckCircle2` import

### 3. 企业侧 - 去掉梯度培育界面
- `src/components/AppSidebar.tsx`：移除 ent 角色侧边栏中的「梯度培育」菜单项（L64）
- `src/App.tsx`：移除 `/green-mfg/ent/incubator` 路由及 `GreenMfgEntIncubator` import（L45, L103）
- 删除文件 `src/pages/GreenMfgEntIncubator.tsx`

### 影响范围
- 政府侧专家评审详情页（区级 + 市级）顶部操作区仅保留「推荐 / 返回列表」按钮
- 企业侧模拟自评价页顶部操作区仅保留「开始评价」按钮
- 企业侧导航不再有「梯度培育」入口；梯度培育能力仅保留在政府侧
- 不涉及业务逻辑改动，仅为前端 UI / 路由 / 导航调整