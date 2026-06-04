## 目标

对完成「数据确权」的记录，在列表中追加一个绿色 `已确权` 徽标；未确权行保持原样、不加任何标识。

## 改动

### 1. 企业侧：`src/pages/GreenMfgEnt.tsx` —— 模拟自我评价表

- 在 `SelfAssessRecord` 接口加可选字段 `attested?: boolean`。
- 在 `MOCK_SELF_ASSESS` 中将最近一次（`SA-2025-003`）和 `SA-2025-001` 标为 `attested: true`，`SA-2025-002` 不加，呈现"部分已确权"效果。
- 在表格"备注"列（或紧贴 AI 打分单元格）的内容中，当 `r.attested` 为 true 时追加一个小徽标：
  ```tsx
  {r.attested && (
    <Badge variant="outline" className="ml-2 h-5 border-success/40 bg-success/10 text-success">
      <CheckCircle2 className="mr-1 h-3 w-3" />已确权
    </Badge>
  )}
  ```
- 放在 AI 打分单元格末尾或单独新增一列均可——采用"紧跟 AI 打分后的同一格"方案，避免新增列影响布局。

### 2. 政府侧：`src/pages/GreenMfgGov.tsx` —— 审核推荐列表

- 在 `MOCK_DECLARATIONS`（`src/components/green-mfg/data.ts`）中为 `DeclarationRecord` 新增可选字段 `attested?: boolean`。
- 给已提交审核 / 已完成 / 培育中等若干典型记录打 `attested: true`（如 `GF-2025-001`、`GF-2025-003`、`GF-2025-004`），其余保持空。
- 在表格"企业名称"单元格名称下方（信用代码同行右侧）或紧贴"流转状态"徽标处追加：
  ```tsx
  {r.attested && (
    <Badge variant="outline" className="ml-1 h-5 border-success/40 bg-success/10 text-success">
      <CheckCircle2 className="mr-0.5 h-3 w-3" />已确权
    </Badge>
  )}
  ```
- 选择放在「流转状态」徽标右侧（同一单元格内），与状态徽标并列，符合"行级标识"语义且不破坏列宽。

## 不改动

- `DataAttestationPanel`、详情页确权 Tab、提交逻辑均不变。
- 不为未确权行加任何文字 / 徽标。
- 不新增列、不改排序、不改筛选。
