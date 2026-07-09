## 修改计划

### 1. 简化 AI 生成中界面
文件：`src/components/green-mfg/AIScoringGeneratingOverlay.tsx`
- 移除 4 个步骤卡片、进度条、已用时/预计剩余、模型版本说明等元素
- 仅保留：机器人图标 + "AI GENERATING" 徽标 + 主文案「正在针对薄弱项生成技改建议，请稍等几分钟....」
- 底部保留「跳过等待，直接查看结果」按钮
- 内部计时器仍保留（默认 8s 后自动 onComplete），仅隐藏其视觉呈现

### 2. AI 打分结果页底部新增「返回查看等待页」按钮
文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`
- 在 `WeakIndicatorsPanel` 之后、`CardContent` 底部添加一个居中按钮「返回查看等待页」
- 点击后：清除 `sessionStorage` 的 `GENERATED_KEY`，并将 `generated` state 置为 `false`，重新进入生成中界面（会再次播放 8s 计时）

### 3. AI 打分结果头部右上角新增「下载技改报告」按钮
文件：`src/components/green-mfg/AIScoringAgentPanel.tsx`
- 在 `CardTitle` 的右侧（`justify-between` 已存在）添加一个 `Button`（`variant="outline"`，`size="sm"`，`Download` 图标 + 文案「下载技改报告」）
- 点击触发前端模拟下载：生成一个简单的文本 Blob（包含综合评分、各维度得分、薄弱项与建议），通过 `a[download]` 触发下载，文件名如 `绿色工厂技改建议报告.txt`。不涉及后端。

### 技术说明
- 全部为前端 UI/交互调整，不改数据模型、不改路由
- 沿用现有 semantic tokens（primary、warning、muted-foreground 等），无新增颜色
- 图标：新增 `Download`、`RotateCcw`（返回等待页）来自 `lucide-react`
