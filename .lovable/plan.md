从企业侧和政府侧的绿色工厂申报/评价流程中移除「真实性承诺」界面。

涉及 5 个文件：

1. `src/pages/GreenMfgEntDeclarationNew.tsx`（企业侧 - 新建申报）
   - 从 `ANCHORS` 数组中移除 `{ href: "authenticity-commitment", label: "真实性承诺" }`
   - 移除 `AuthenticityCommitmentCard` 和 `AuthenticityCommitmentValue` 的 import
   - 移除 `commitment` state 及其 `setCommitment` setter
   - 移除 `StepTabs` 中 `authenticity-commitment` 对应的条件渲染块（`ANCHORS[3]` 处的 `AuthenticityCommitmentCard`）
   - 后续 step 索引自动顺延（AI 打分智能体从 `ANCHORS[4]` 变为 `ANCHORS[3]`）

2. `src/pages/GreenMfgEntDeclarationDetail.tsx`（企业侧 - 申报详情）
   - 从 `TABS` 数组中移除 `{ value: "authenticity-commitment", label: "真实性承诺" }`
   - 移除 `AuthenticityCommitmentCard` 的 import
   - 移除 `<TabsContent value="authenticity-commitment">` 及其内部 `<AuthenticityCommitmentCard>` 渲染

3. `src/pages/GreenMfgGovDeclarationDetail.tsx`（政府侧 - 申报详情）
   - 从 `TABS` 数组中移除 `{ value: "authenticity-commitment", label: "真实性承诺" }`
   - 移除 `AuthenticityCommitmentCard` 的 import
   - 移除 `<TabsContent value="authenticity-commitment">` 及其内部 `<AuthenticityCommitmentCard>` 渲染

4. `src/pages/GreenMfgEntReviewNew.tsx`（企业侧 - 新建自我评价）
   - 从 `ANCHORS` 数组中移除 `{ href: "authenticity-commitment", label: "真实性承诺" }`
   - 移除 `AuthenticityCommitmentCard` 和 `AuthenticityCommitmentValue` 的 import
   - 移除 `commitment` state 及其 `setCommitment` setter
   - 移除 `StepTabs` 中 `authenticity-commitment` 对应的条件渲染块

5. `src/components/green-mfg/DeclarationDetailSections.tsx`（综合面板组件）
   - 从 `DeclarationDetailSections` 函数组件中移除 `<AuthenticityCommitmentCard />`
   - 保留 `AuthenticityCommitmentCard` 组件本身的导出定义（其他模块可能独立引用，但本面板不再使用）

注意：不删除 `DeclarationDetailSections.tsx` 中 `AuthenticityCommitmentCard` 组件的实现代码，仅移除其在各页面和综合面板中的引用与渲染。