## 目标
政府侧（AI 一键打分页）将"审核备注"改为"修订备注"，并改为"仅当政府修改了指标值才出现，且为必填项"。

## 改动文件
`src/components/green-mfg/DeclarationDetailSections.tsx`

## 改动点

### 1. 文案 "审核备注" → "修订备注"
- 第 1563 行 `<ClipboardCheck /> 审核备注` → `修订备注`
- placeholder 已经是"如指标值有修订…"，保留不变

### 2. 仅当指标值被修订时才展示备注框（政府侧）
当前条件（第 1560 行）：
```
{showGovRemark && (govEditable || row.govRemark) && ...}
```
改为：政府侧仅在 `isRowRevised(row)` 为 true 时展示；其他角色保持原行为（有 `row.govRemark` 时只读展示）。

```
{showGovRemark && (
  (govEditable && isRowRevised(row)) ||
  (!govEditable && row.govRemark)
) && ...}
```

### 3. 必填校验与视觉提示
- 当 `govEditable && isRowRevised(row)` 时：
  - Textarea 增加 `required` 语义、`aria-invalid` 当为空时为 true
  - 标题"修订备注"后追加红色 `*` 必填标记
  - 当 `(row.govRemark ?? "").trim() === ""` 时：
    - Textarea 边框变为 `border-destructive`
    - 标题下方显示一行小字提示："已修改指标值，请填写修订备注（必填）"
- 仅作为前端表单展示约束。当前页面没有统一的"保存/提交"按钮在该组件内触发提交，所以校验以视觉必填提示 + `aria-invalid` 呈现，符合"如果修改指标值，则出现修订备注且是必填项"的视觉规则。

### 4. 同步入口/筛选/统计中的文案（如适用）
检索结果表明 `审核备注` 仅出现在该组件第 1563 行 和 `evaluationIndicators.ts` 内的示例数据字段说明里。`evaluationIndicators.ts` 中若仅是注释/示例描述，可一并替换为"修订备注"以保持统一；如是类型字段名（如 `govRemark`）则保持不动。

## 不改动
- 数据模型字段名 `govRemark`、`originalReportValue` 等
- 企业侧（`ent` 模式）行为
- AI 一键打分流程本身
