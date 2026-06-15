## 调整范围

仅修改 `src/pages/GreenMfgGovDeclarationDetail.tsx`，前端展示层调整，不涉及业务数据结构。

## 改动点

### 1. 顶部操作按钮（替换审批三连按钮）
去掉「驳回 / 进入培育 / 通过」三个按钮及对应的 `approveOpen / cultivateOpen / rejectOpen` Dialog、`handleApprove / handleCultivate / handleReject` 函数、`comment` state。

新增单个「推荐」按钮：
- 文案：`推荐` (图标 `ThumbsUp` 或 `Star`)
- 样式：primary 风格
- 点击后：
  - 状态切换为「已推荐」（本地 state `recommended: boolean`）
  - 顶部 stage Badge 旁追加一个绿色 `已推荐` 徽标
  - 按钮自身变为 `已推荐`（disabled 或可再次点击「取消推荐」）
  - `toast.success("已标记为推荐企业")`
- 孵化器场景（`isIncubator`）保持原逻辑：不显示推荐按钮

### 2. 去掉「审批记录」子 Tab
- 从 `TABS` 数组中移除 `{ value: "audit-record", label: "审批记录" }`
- 删除对应的 `<TabsContent value="audit-record">` 区块
- 移除不再使用的 import：`AuditFlowTimeline`、`MOCK_AUDIT_FLOW`、`ChevronRight`、`ShieldCheck`、`ShieldX`、`Clock`、`Dialog*`、`Textarea` 等
- 默认 active tab 仍为 `evaluation-indicator`（已是第一项）

## 不变项

- 企业侧（Ent）流程、孵化器流程、其它 Tab 内容、评价指标表、AI 打分结果面板均不动
- 数据模型 `MOCK_DECLARATIONS` 不动（stage 字段保留，仅展示用）
