## 目标

让所有列表的单元格内容默认不换行，仅对确实可能超长的列（如「地址」「下属企业」等）允许换行；表格横向超出时通过外层滚动条横向滚动。

## 改动范围

### 1. 全局：`src/components/ui/table.tsx`
- `TableCell` 默认加上 `whitespace-nowrap`，与表头保持一致行为。
- `TableHead` 已是 `whitespace-nowrap`，无需改动。
- `Table` 外层已有 `overflow-auto` 容器，天然支持横向滚动；不动。

这样所有表格的所有单元格默认单行显示，超出列宽则被滚动条承载。

### 2. 例外列：手动允许换行

在 `src/pages/SystemUsers.tsx` 中给确实需要换行的列加 `whitespace-normal`（覆盖默认的 nowrap）：

- `DistrictTable`：
  - 「单位全称」列单元格：`whitespace-normal`，限制 `max-w-[180px]`
  - 「地址」列单元格：`whitespace-normal break-all`，限制 `max-w-[200px]`
- `GroupTable`：
  - 「地址」列单元格：`whitespace-normal break-all`，`max-w-[200px]`
  - 「管辖下属企业」非下钻分支的标签云容器保持 `flex-wrap`（已存在），单元格设 `whitespace-normal`
- `EnterpriseTable`：
  - 长字段（如「企业名称」「行业」）若过宽则给 `whitespace-normal` + `max-w-[xxx]`，其它字段（账号、信用代码、手机号、状态、操作）保持默认 nowrap。

### 3. 视觉一致性

- 不修改字号/行高/边距，只调整换行行为。
- 行高随着多行单元格自适应，与现有截图一致。
- 不引入水平滚动条样式定制，沿用浏览器默认。

## 不在范围内

- 其它页面（报表、考核、能耗等）的表格也会一并受益于全局 `whitespace-nowrap` 默认值；如某些页面出现横向溢出，依靠外层 `overflow-auto` 的滚动条承载，符合用户的总体期望。如发现某个特定页面有需要换行的列再单独添加 `whitespace-normal`。
