## 目标
在企业侧模拟自我评价（`GreenMfgEntDeclarationNew`）中，新增"一键上传证明材料 → AI 智能体自动匹配到对应指标"的能力。企业无需在每个指标处手动上传；未匹配上的文件归集到"未匹配文件区"，由企业手动调整。

## 整体交互流程

```
[基本信息] → [基本要求] → [评价指标表] → [AI 打分]
                            ↑
              新增：顶部"智能材料上传"入口（贯穿"基本要求"与"评价指标表"两步）
```

1. 在"基本要求"和"评价指标表"步骤顶部，新增一个 **"AI 材料智能归集"面板**（默认折叠为一个高亮 Banner，点击展开为抽屉 Sheet）。
2. 企业一次性把多份证明文件拖拽 / 选择上传。
3. 智能体进度条展示"解析中 → 匹配中 → 完成"，每个文件被识别后显示：
   - 文件名 / 大小 / 类型
   - AI 推断的指标归属（一级 → 二级 → 三级），可显示匹配置信度（高/中/低）
   - 状态徽章：`已匹配` / `多处可能` / `未匹配`
4. 匹配上的文件自动写入对应 `IndicatorRow.proofs` 或 `BasicRequirementItem.proofs`。
5. 未匹配文件进入"未归集文件"列表，企业可：
   - 手动从下拉选择指派到任一指标 / 基本要求条款
   - 直接删除
   - 标记为"附件备查"
6. 已匹配文件也可被企业"撤回 / 重新指派 / 删除"。
7. 指标表行内：在 `proofs` 字段处显示一个 ✨ 标记 + tooltip"AI 自动归集"，与手动上传区分。

## 新增 / 修改文件

### 新增
- `src/components/green-mfg/AIMaterialIntakePanel.tsx`
  - 顶部 Banner（折叠态）：图标 + "AI 材料智能归集 · 已上传 12 / 已匹配 9 / 未匹配 3" + "打开" 按钮
  - 展开态（Sheet 右侧抽屉，宽 720px）包含三块：
    1. **上传区**：拖拽框（多文件，支持 PDF/图片/Excel/Word），上传后显示总进度条与"AI 重新匹配"按钮
    2. **匹配结果列表**：表格 [文件名 | 类型 | AI 归属指标（可改） | 置信度 | 状态 | 操作]
       - 归属指标使用级联 Select（一级→二级→三级 / 或"基本要求-序号X"）
       - 置信度：进度条 + 百分比
       - 操作：重新匹配 / 移除 / 标记备查
    3. **未匹配文件区**：单独列表 + 提示"AI 未能匹配，请手动指派或删除"
  - 内部使用 `useReducer` 维护文件集合 `MaterialFile[]`

### 修改
- `src/components/green-mfg/evaluationIndicators.ts`
  - 给 `proofs` 配套新增可选 `proofMeta?: { name: string; source: "ai" | "manual"; confidence?: number }[]`（保持向后兼容，UI 优先读 meta）
- `src/components/green-mfg/DeclarationDetailSections.tsx`
  - `EvaluationIndicatorCard` / `BasicRequirementsCard` 接受新 prop `aiMatchedKeys?: Set<string>`，在 proofs 单元渲染 ✨ 徽章
  - 暴露一个 `appendProofs(indicatorId, files)` 工具供 Panel 调用（通过 onChange 实现）
- `src/pages/GreenMfgEntDeclarationNew.tsx`
  - 在"基本要求"和"评价指标表"步骤上方挂载 `<AIMaterialIntakePanel value={...} onApply={(matches) => {...}} />`
  - 实现 `onApply`：根据匹配结果合并 `proofs` 到 `basicReqs` / `indicators`，并保存"未匹配文件"到组件本地 state（同时持久化到 draft）
  - `DraftPayload` 增加 `materialPool: MaterialFile[]`

## Mock AI 匹配逻辑（前端 demo）

无真实后端 — 用纯前端模拟：
- 上传时 `setTimeout` 模拟解析延时（1.5s）
- 根据文件名关键词匹配指标关键字（如 "能耗" → 综合能耗指标；"碳排放" → 温室气体指标；"ISO14001" → 环境管理体系基本要求）
- 命中 → 状态 `已匹配`，置信度 75–98%
- 未命中 → 状态 `未匹配`
- 多关键词命中 → 状态 `多处可能`，弹出选择

匹配规则集中在 `src/components/green-mfg/aiMaterialMatcher.ts`（新增），便于后续替换为真实 API。

## 视觉规范
- Banner 用 `bg-gradient-primary/10` + `Sparkles` 图标（与现有"模拟自我评价"卡片一致）
- 状态徽章：已匹配 = success、多处可能 = warning、未匹配 = destructive 浅色
- 抽屉用现有 `Sheet` 组件；表格用现有 `Table`
- 不改动政府侧

## 不在本次范围
- 真实文件存储（仅前端 mock，文件保存为 File 对象 + 名称）
- AI 模型调用（不接 Gateway，纯规则）
- 评价指标数据结构大改

确认后开始实现。