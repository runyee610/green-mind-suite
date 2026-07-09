## 修改计划

### 1. 去掉 AI 生成中的等待中间页
文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`
- 移除 `generated` state 和 `AIScoringGeneratingOverlay` 的分支渲染，直接展示 AI 打分结果（评分 + 薄弱项）
- 移除 `handleBackToWaiting` 及底部「返回查看等待页」按钮
- 移除对 `sessionStorage GENERATED_KEY` 的读写
- 保留 `AIScoringGeneratingOverlay.tsx` 文件本身（暂不删除，避免误伤其他引用），仅本面板不再使用

### 2. 「下载技改报告」改为异步生成态
文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`
- 新增 state：`reportReady: boolean`（初始 `false`）
- 面板首次挂载后，通过 `useEffect + setTimeout`（默认 8 秒）将 `reportReady` 置为 `true`；结果通过 `sessionStorage` 记忆一次，避免同一会话反复"生成"
- 在 CardTitle 右上角原「下载技改报告」按钮位置：
  - `reportReady === false`：显示一个不可点击的提示胶囊（`Loader2` 旋转图标 + 文案「技改报告生成需要几分钟，请稍候~」，`text-muted-foreground` + `border-dashed`）
  - `reportReady === true`：显示原「下载技改报告」按钮（`Download` 图标），点击触发前端 Blob 下载（逻辑不变）

### 技术说明
- 全部为前端 UI/交互调整，无数据/路由/后端变更
- 移除 `RotateCcw` 图标引用；新增 `Loader2` 引用（来自 `lucide-react`）
- 沿用现有 semantic tokens，无新增颜色
