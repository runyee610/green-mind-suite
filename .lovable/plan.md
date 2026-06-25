## 梯度培育列表改造

### 目标文件
`src/pages/GreenMfgGovIncubator.tsx`

### 改动

**1. 删除卡片统计数据**
- 移除顶部 6 张 KPI 卡片区块及 `KpiCard` 组件
- 移除相关统计计算（scopeAvgScore、scopeKeyEnergy 等）

**2. 列表列调整为图中展示字段**

| 列 | 数据来源 |
|---|---|
| 序号 | 行索引 |
| 所属区 | `district` |
| 企业（园区）名称 | `name` |
| 行业 | `industry` |
| 企业性质 | 新增 mock：国有 / 民营 / 外资 / 中外合资 |
| 产值（万元） | `outputValue`（部分显示 `/`） |
| 综合能耗（当量值）（吨标煤） | `energyConsumption` |
| 类型 | 新增 mock：绿色工厂 / 绿色供应链管理 / 组合 |
| 联系人 | 新增 mock 姓名 |
| 联系方式 | 新增 mock 手机号（中间打码） |
| 操作 | 见下 |

为 `IncubateRecord` 增加字段：`ownership`、`greenType`、`contactName`、`contactPhone`。在 `INITIAL_INCUBATE_DATA` 9 条记录中补齐。

**3. 操作列**
- 去掉"详情"按钮（去掉详情入口）
- 保留"退库"按钮
- 区级专家视角额外增加"推荐到市级"按钮（点击 toast 提示并将该记录 `level` 改为 `市级` 从当前列表移除；或仅 toast 提示，保持简单——采用：toast 成功 + 从区级列表移除并加入市级）

**4. 其他**
- 保留顶部"区级/市级 专家视角"切换
- 保留搜索、行业、企业类型筛选
- 不删除路由 `/green-mfg/gov/incubator/:id`（其他入口可能使用），仅移除本页详情按钮

### 非改动
- 不修改其他页面、不改后端/业务逻辑
