## 目标

在「市管理员」视角下，为「区/园区列表」和「集团列表」两个子 Tab 增加新的展示列，与现有截图保持一致。

## 改动范围

仅修改 `src/pages/SystemUsers.tsx`：
- `DistrictUser` 接口、`GroupUser` 接口（增加字段）
- `districtUsers` 等 mock 数据（补充字段值）
- `DistrictTable` 组件（新增 2 列）
- `GroupTable` 组件（新增 2 列）

## 1. 区/园区列表 Tab — 新增列

参考图1，在「区县/园区名称」列后插入：
- **单位全称**：如「黄浦区商务委员会」「青浦区经济委员会技术进步科」。文本左对齐，最多 2 行截断。
- **地址**：如「广东路357号1号楼西908室品牌经济科」。`text-muted-foreground`，最大宽度限制，多行换行。

`DistrictUser` 接口新增：
```ts
fullName: string;   // 单位全称
address: string;    // 地址
```

mock 数据补全相应字段（区与园区均补）。

新列顺序：账号 → 区县/园区名称 → **单位全称** → **地址** → 负责人 → 中心对口人 → 辖区企业数 → 手机号 → 状态 → 操作。

## 2. 集团列表 Tab — 新增列

参考图2，在「集团负责人」列后插入：
- **地址**：集团办公地址，多行换行，`text-muted-foreground`。
- **中心对口人**：单字段文本（与区列表中心对口人样式一致）。

`GroupUser` 接口新增：
```ts
address: string;
cityContact: string;
```

mock 数据补全相应字段。

新列顺序：账号 → 集团名称 → 集团负责人 → **地址** → **中心对口人** → 管辖下属企业 → 手机号 → 状态 → 操作。

## 交互一致性

- 字段样式（字号 `text-xs`、表头 `h-9`、padding `py-2`）保持与现有列一致。
- 地址列使用 `max-w-[200px] whitespace-pre-wrap break-all` 控制宽度，避免撑爆表格。
- 中心对口人沿用 `text-muted-foreground` 灰色文字。
- 不改动现有列、操作按钮、下钻逻辑。
