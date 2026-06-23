## 恢复"批次"相关功能

### 1. 政府侧 · 专家评审 - 恢复批次管理弹窗

文件：`src/pages/GreenMfgGov.tsx`

- 新增本地 state：`batches`（初始值来自 `DECLARATION_BATCHES`）、`batchDialogOpen`
- 新增帮助函数 `batchInUse(name)`：判断批次是否被 `MOCK_DECLARATIONS` 中任意记录使用（用于禁用删除）
- 新增三个 CRUD handlers：
  - `handleAddBatch(name)`：去空、查重后追加
  - `handleEditBatch(oldName, newName)`：重命名，校验唯一；同步更新 `batchFilter`
  - `handleDeleteBatch(name)`：若 `batchInUse` 则 toast 提示并阻止；否则移除并重置筛选
- 将"批次"下拉的 options 由 `DECLARATION_BATCHES.map` 改为 `batches.map`，让筛选项响应增删改
- 在批次下拉旁新增「**批次管理**」按钮（`Settings2` 图标，`variant="outline"` `size="sm"`），点击打开 `BatchManageDialog`
- 在文件底部新增 `BatchManageDialog` 组件（弹窗形式）：
  - 顶部"新增批次"输入框 + 「新增」按钮
  - 表格列出现有批次，每行支持「重命名」（行内编辑 + 保存/取消）和「删除」（被使用则禁用并 tooltip 提示）
  - 关闭按钮
- 导入 `Settings2` 图标和 `Dialog` 系列组件

### 2. 企业侧 · 开始评价 - 恢复"评价批次"下拉

文件：`src/pages/GreenMfgEntDeclarationNew.tsx`

- 导入 `Select` 系列组件 与 `DECLARATION_BATCHES`（来自 `@/components/green-mfg/data`）
- 新增 state：`const [batch, setBatch] = useState<string>(DECLARATION_BATCHES[0])`
- 在顶部操作栏左侧（`draftSavedAt` 旁）新增一段：
  - 标签"评价批次"
  - `<Select>` 绑定 `batch` / `setBatch`，options 来自 `DECLARATION_BATCHES`
  - 宽度与其他下拉风格保持一致（`h-8 w-40 text-xs`）
- 将 `batch` 写入草稿 payload（`DraftPayload` 加 `batch?: string`），保存/读取草稿时一并处理；不修改提交流程其它逻辑

### 不改动

- 路由、菜单、权限、数据 mock 字段保持不变
- `DECLARATION_BATCHES` 内容不变
- 详情页、动态管理、零碳、培育等其他页面不动
