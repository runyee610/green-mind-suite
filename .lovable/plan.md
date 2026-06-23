## 目标

为企业侧打通"加入培育库 → 梯度培育页面 → 退库 → 重新加入"的完整前端交互闭环。

## 1. 培育状态来源（无需新增存储）

复用 `incubatorResearchData.ts` 中已有的 `loadResearch(creditCode)` 作为"是否在培育库"的判定依据：
- 返回非 `null` → 已在培育库
- 返回 `null` → 未加入

新增一个导出函数 `clearResearch(creditCode)`：从 localStorage 的 `green-mfg-incubator-research` 移除该企业记录，并 dispatch 现有的 `incubator-research-updated` 事件，让所有订阅页面同步刷新。

## 2. 企业侧模拟自我评价列表页 `GreenMfgEnt.tsx`

加入培育库按钮改为受控状态：

- 用 `useState` + `useEffect` 监听 `incubator-research-updated` 事件，从 `loadResearch(myDeclaration.creditCode)` 得到 `joined` 布尔值。
- 按钮渲染：
  - `joined === false` → 按钮文案 `加入培育库`（图标 `Sprout`），点击执行现有的 `runIncubatorResearch` + toast。
  - `joined === true` → 按钮文案 `已加入培育库`（图标 `CheckCircle2`），`variant="outline"`，`disabled`，鼠标悬浮 tooltip 不必加，保持简洁。

## 3. 企业侧梯度培育页面 `GreenMfgEntIncubator.tsx`

右上角增加 `退库` 按钮 + 二次确认；未加入时切换为 `加入培育库` 按钮。

### 头部布局调整

在第一张「企业培育总览」卡片顶部"企业标识"行右侧，新增按钮区域：

- 已加入（`research != null`）：显示 `退库` 按钮（`variant="outline"`，图标 `LogOut`，文案色用 `text-destructive`）。点击触发 `AlertDialog` 二次确认：
  - 标题：`确认退出培育库？`
  - 描述：`退库后将清除 AI 智能体调研结果，可重新加入再次启动调研。`
  - 取消 / 确认退库（destructive 样式）
  - 确认后：调用 `clearResearch(creditCode)`，本地 state 置空，`toast.success("已退出培育库")`。
- 未加入：显示 `加入培育库` 主按钮（`bg-gradient-primary`，图标 `Sprout`），点击调用 `runIncubatorResearch` 并 `toast.success`。

### 退库后的空态展示

当 `research == null` 时，原有的 AI 节能技术推荐卡片内已有"请先在模拟自我评价页点击加入培育库启动调研"的空态。改造：

- 文案改为 `当前未加入培育库，加入后 AI 智能体将自动启动节能技术调研。`
- 卡片内的"立即启动调研"按钮保留，点击同样走 `runIncubatorResearch`，与顶部按钮共用同一处理函数。

此外，"企业培育总览"卡片中"培育目标"进度条与"培育期信息"在未加入状态下加一个轻提示徽标：`未加入培育库`（位于"培育目标"标题右侧的小 `Badge`，`variant="outline"`，muted 配色），目标分值与培育期数据仍显示（来自企业静态数据），不影响阅读。

## 4. 事件同步

`GreenMfgEnt.tsx` 与 `GreenMfgEntIncubator.tsx` 都通过监听 `incubator-research-updated` 事件刷新本地 `joined` 状态，因此：

- 在列表页加入 → 跳到培育页：按钮显示"退库"
- 在培育页退库 → 返回列表页：按钮恢复"加入培育库"
- 同浏览器多 Tab 也会因 localStorage 变化而同步（额外可监听 `storage` 事件，可选）

## 涉及文件

- `src/components/green-mfg/incubatorResearchData.ts`：新增 `clearResearch(creditCode)` 导出。
- `src/pages/GreenMfgEnt.tsx`：按钮受控为"加入培育库 / 已加入培育库"。
- `src/pages/GreenMfgEntIncubator.tsx`：右上角"退库 / 加入培育库"按钮 + `AlertDialog` 二次确认 + 未加入空态文案微调。

无后端 / 业务逻辑改动，纯前端交互。
