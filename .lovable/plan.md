## 修改 `src/components/green-mfg/AIScoringAgentPanel.tsx`

**1. 定时器由 8s → 4s**
- `REPORT_DELAY_MS` 由 `8000` 改为 `4000`。

**2. 每次进入"AI打分结果"tab 都重新播放"生成中"提示**
- 移除模块级持久变量 `moduleTimer` / `moduleReportReady`，也不再使用 `reportReadyProp`。
- 组件挂载时始终以 `reportReady = false` 起步，`useEffect` 内启动 4s 定时器，卸载时清理。
- 效果：从"基本信息"等其他子 tab 切回"AI 打分结果"时，组件重新挂载，提示重新出现 4 秒后再显示下载按钮。

**3. "技改报告生成需要几分钟，请稍候~" 视觉：去掉虚线框，改为轻提示**
- 移除 `border border-dashed border-muted-foreground/40 bg-muted/30` 的胶囊容器。
- 改为柔和的浅色胶囊：`bg-primary/5 text-primary/80`（无边框），文字更轻；配合 `animate-pulse` 让整体有呼吸感的轻提示效果；`Loader2` 保持 `animate-spin`。
- 保持在 `CardTitle` 右侧原位置，尺寸/间距与原下载按钮对齐（h-8、px-3、text-xs）。

## 不改动
- `reportReady` 作为可选 prop 的类型签名保留（外部未使用），或一并移除该 prop —— 采用后者，接口更干净。父组件 `GreenMfgEntDeclarationNew.tsx` 目前未传该 prop，无需改动。
- 打分结果、薄弱项、下载报告的业务逻辑不变。