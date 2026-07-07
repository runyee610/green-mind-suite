
## 目标（4 个前端交互改动）

### 1. 培育库新增"编辑"功能
在 `src/pages/GreenMfgGovIncubator.tsx` 的操作列每一行加"编辑"按钮：
- 复用现有新增 Dialog 组件（改造为受控 `mode: "add" | "edit"`）
- 打开时用当前行数据回填 `form`；提交时按 id 更新 `data`，保留 `id / stage / enterDate / score / prevScore / carbonIntensity / improvement / reviewer / nextAction`。
- 编辑态下"梯队"字段允许切换，其它校验规则复用现有的 `handleAddSubmit`。
- Dialog 标题、描述、确认按钮文案按 mode 切换（新增 / 保存修改）。

### 2. 薄弱项增加"建议文案"（推荐节能技改技术 / 具体措施）
在 `src/components/green-mfg/AIScoringAgentPanel.tsx` 中：
- 扩充 `suggestionFor(name)` 为 `getSuggestion(name)`，返回结构化建议：
  ```ts
  { technologies: string[]; measures: string[] }
  ```
- 覆盖当前 8 类关键词（能耗、碳排、水、固废/污染、绿色设计/产品、工艺/设备、管理平台、土地），每类给 3–4 条具体技术（如"MVR 蒸发浓缩""高效永磁同步电机""余热回收 ORC""光伏 + 储能微电网""VOCs RTO 焚烧""智能空压站群控"等）+ 2–3 条落地措施（"引入 EMS 能源管理系统并接入市级平台""开展第三方能源审计""签订绿电采购协议 ≥30%"等）。
- `WeakIndicatorsPanel` 里每张薄弱卡片下方原来的一句灯泡提示，改为两段式：
  - 「推荐节能技改技术」 → chip 化标签列表
  - 「建议采取措施」 → 带 `•` 的短列表
- 保持卡片整体在两列网格内不溢出；文案样式沿用现有 warning 色系。

### 3. 模拟自评价详情页返回时自动保存
在 `src/pages/GreenMfgEntDeclarationNew.tsx`：
- 顶部"返回"按钮的 `onClick` 改为 `handleSave()` → `navigate("/green-mfg/ent")`。
- toast 由"已保存"改为"已自动保存草稿"，避免与手动"保存"按钮混淆。
- 底部的浏览器/系统级返回（`beforeunload`）不做处理，仅覆盖页面内"返回"按钮，保持范围最小。

### 4. 培育库市级视角操作列增加"降到区级梯队"按钮
在 `GreenMfgGovIncubator.tsx` 操作列：
- 现有"升到市级梯队"（区级视角 + 区级记录才显示）保持不变。
- 新增"降到区级梯队"按钮：仅在 `viewLevel === "市级"` 且 `r.level === "市级"` 时显示，样式与"升到"对称——使用 `ArrowDownCircle` 图标 + `text-muted-foreground`/`border-muted` 中性描边，与危险性的"退库"红色区分开。
- 新增 `demoteTarget` 状态与 `AlertDialog` 二次确认（复用现有 AlertDialog 组件），确认后 `setData(...level: "区级")`，toast 提示。

---

## 涉及文件
- `src/pages/GreenMfgGovIncubator.tsx`（任务 1、4）
- `src/components/green-mfg/AIScoringAgentPanel.tsx`（任务 2）
- `src/pages/GreenMfgEntDeclarationNew.tsx`（任务 3）

无路由、无数据模型、无后端变更；纯前端交互与展示。
