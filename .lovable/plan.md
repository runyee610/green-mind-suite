## 修改计划

### 1. 去掉方块格子背景
**文件**：`src/components/green-mfg/AIScoringAgentPanel.tsx`

- 移除 Card 顶部那个网格线背景层（第 214-223 行），即 `opacity-[0.07]` 的 `linear-gradient` 交叉网格图案。
- 保留其他装饰性背景（右侧/底部模糊光晕、评分结果区的径向渐变）。

### 2. 修复切换子 tab 后提示重复出现
**文件**：`src/components/green-mfg/AIScoringAgentPanel.tsx` + `src/pages/GreenMfgEntDeclarationNew.tsx`

当前 `AIScoringAgentPanel` 内部用 `useState + sessionStorage` 管理 `reportReady`，但页面里通过 `{currentStep === "ai-scoring" && <AIScoringAgentPanel />}` 条件渲染，组件切走即卸载，导致 `sessionStorage` 回写可能未及时生效（或浏览器限制下失效），用户反馈每次切回都重新出现等待提示。

**修复方案**：
- 将 `reportReady` 状态提升到父页面 `GreenMfgEntDeclarationNew`（用 `useState` + `useRef` 记录是否已启动过定时器），通过 prop 传入 `AIScoringAgentPanel`。
- 在 `GreenMfgEntDeclarationNew` 中，组件首次挂载到 "ai-scoring" 时启动一次 `setTimeout(8s)`，之后即使切换 tab 导致子组件卸载/重挂，状态由父组件保持，不会重复出现等待提示。
- `AIScoringAgentPanel` 改为接收 `reportReady: boolean` prop，不再自己管理 sessionStorage 和定时器。

### 技术说明
- 纯前端 UI/状态调整，无后端变更。
- 不涉及新增颜色 token。
