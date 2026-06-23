## 目标
修改政府侧「推荐管理」列表页（`src/pages/GreenMfgGov.tsx`）中「AI 智能打分 / 专家推荐」这一列，使其根据顶部「区级专家 / 市级专家」切换标签展示不同内容：

- **区级专家视角**：表头改为「AI打分/区得分」，下方仍展示 2 个分值，格式不变（如 `86 / 88`）。
- **市级专家视角**：表头改为「AI打分/区得分/市得分」，下方展示 3 个分值，格式如 `62/65/-` 或 `62/65/70`。其中第 3 个分值为市级打分，暂无数据时显示 `-`。

## 实现步骤

### 1. 数据层扩展（`src/components/green-mfg/data.ts`）
- 在 `DeclarationRecord` 接口中新增可选字段 `cityScore?: number`（市级专家打分）。
- 在 `MOCK_DECLARATIONS` 中为部分已推荐到市级的企业补充 `cityScore` 值，未评分的保持 `undefined`（显示为 `-`）。

### 2. 表头文案切换（`src/pages/GreenMfgGov.tsx`）
- 将当前固定的 `<TableHead>AI 智能打分 / 专家推荐</TableHead>` 改为条件渲染：
  - `expertView === "district"` → `AI打分/区得分`
  - `expertView === "city"` → `AI打分/区得分/市得分`

### 3. 单元格分值展示切换（`src/pages/GreenMfgGov.tsx`）
- 区级专家：`{r.score} / {r.manualScore ?? "—"}`（保持现有逻辑）。
- 市级专家：`{r.score}/{r.manualScore ?? "—"}/{r.cityScore ?? "—"}`（3 个分值，无数据时显示 `—`，与截图中 `-` 保持一致）。

## 涉及文件
- `src/components/green-mfg/data.ts`
- `src/pages/GreenMfgGov.tsx`

## 验收标准
- 切换「区级专家」时，列头为「AI打分/区得分」，数据行仅显示 2 个分值。
- 切换「市级专家」时，列头为「AI打分/区得分/市得分」，数据行显示 3 个分值；有市级打分的展示具体数字，没有的展示 `-`。
- TypeScript 编译通过，页面无报错。