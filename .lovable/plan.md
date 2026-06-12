## 修改内容

### 1. 企业侧模拟自我评价（`GreenMfgEntReviewNew.tsx`）
- 移除顶部卡片中的「提交审核」按钮
- 移除底部导航中的「提交审核」按钮（最后一步时）
- 清理不再使用的 `Send` 图标导入和 `handleSubmit` 函数

### 2. 企业侧评价详情页（`GreenMfgEntDeclarationDetail.tsx`）
- 从 `TABS` 数组中移除「数据确权」项
- 移除对应的 `TabsContent` 内容块
- 清理 `DataAttestationPanel` 导入

### 3. 政府侧评价详情页（`GreenMfgGovDeclarationDetail.tsx`）
- 从 `TABS` 数组中移除「数据确权」项
- 移除对应的 `TabsContent` 内容块
- 清理 `DataAttestationPanel` 导入

共修改 3 个文件，无新增依赖。