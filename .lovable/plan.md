## 修改计划

问题：`reportReady` 状态通过 `sessionStorage` 记忆，一旦生成完成后刷新页面也不会再回到"生成中"提示，导致不便复看。

### 方案
文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`

在 CardTitle 右上角，「下载技改报告」按钮 / 生成中提示胶囊 **旁边** 增加一个小的图标按钮「重新生成」（`RotateCcw` 图标，`variant="ghost"` `size="icon"`，`h-8 w-8`，带 tooltip / `title="重新生成技改报告"`）。

点击后：
- `sessionStorage.removeItem(REPORT_READY_KEY)`
- `setReportReady(false)`
- `useEffect` 依赖 `reportReady`，会自动重新启动 8 秒 `setTimeout`，从而再次显示「技改报告生成需要几分钟，请稍候~」，随后再切回下载按钮

该按钮在两种状态（生成中 / 已就绪）下始终可见，方便随时复现。

### 技术说明
- 纯前端 UI 调整，不动数据与业务逻辑
- 复用已导入的 `RotateCcw` 图标（若已被移除，则从 `lucide-react` 重新引入）
- 沿用现有 semantic tokens
