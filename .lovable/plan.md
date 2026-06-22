仅修改政府侧梯度培育页 `src/pages/GreenMfgGovIncubator.tsx`，并新增一个政府侧详情页用于复用企业侧的「企业培育总览 + AI 节能技术推荐 + 改进建议」布局。不改动数据结构。

## 一、顶部视角切换：区级专家 / 市级专家

- 在页面标题下增加一个 Tabs（或分段控件）：`区级专家 ｜ 市级专家`，默认区级，状态保存在 `viewLevel: "区级" | "市级"`
- 切换后驱动整页（KPI 卡片、3 个流转统计卡片、列表）按对应 `level` 过滤
- 移除右上角原有的「级别」筛选下拉（与顶部切换重复）
- 移除列表中的「级别」列

## 二、KPI 卡片：按视角过滤

将当前 4 张卡片改为按当前视角统计同一份数据（数据源不变，仅过滤条件不同）：

- 区级专家视角：4 张卡片只统计 `level === "区级"` 的企业
  - 区级培育库总数 / 本年新增 / 平均得分
  - 重点用能单位（区级范围内）
  - 10亿+非重点规上（区级范围内）
  - 在培数（剔除退库与晋级出库）
- 市级专家视角：4 张卡片只统计 `level === "市级"` 的企业，字段同上替换为"市级培育库"等

卡片标题、副标题文案随视角自动切换。

## 三、培育闭环 → 3 张统计卡片

去掉「培育体系闭环流转」整块 Card（包括阶段管道、退库回流文案、晋级转化率行）。改为与上面 KPI 卡片同一行/同一栅格的 3 张统计卡片，整合到顶部，统一为 7 张卡片网格（建议 `grid md:grid-cols-4 xl:grid-cols-7`，或拆为两行 4+3）：

- 入库登记：当前视角下 `stage === "入库登记"` 数量
- 诊断调研：当前视角下 `stage === "诊断评估"` 数量（命名按用户："诊断调研"）
- 晋级出库：当前视角下 `stage === "晋级出库"` 数量

3 张卡片点击仍可作为阶段筛选触发（沿用 `stageFilter` 行为，去掉中间「整改提升 / 复评预审」按钮）。`STAGE_PIPELINE` 数组裁剪为这 3 项，仅在「阶段」筛选下拉中保留这 3 个选项。

## 四、列表精简

`企业 / 信用代码` 列：

- 去掉信用代码小字 `r.creditCode`
- 去掉 `入库 {enterDate} · {reviewer}` 小字行
- 仅保留企业名称

`得分（环比）` 列：

- 去掉环比 `▲/▼ 数字` 行
- 仅展示 `r.score`
- 列标题改为「得分」

删除以下两列：

- 「培育阶段」列
- 「下一步行动」列

同时删除上文已要求去掉的「级别」列。表头 `colSpan` 空态相应调整。

## 五、详情页跳转与企业侧保持一致

- 列表「详情」按钮原来跳转 `/green-mfg/gov/declaration/${r.id}`，改为新路由 `/green-mfg/gov/incubator/:id`
- 新增页面 `src/pages/GreenMfgGovIncubatorDetail.tsx`：
  - 复用 `GreenMfgEntIncubator` 已有的三块结构：企业培育总览面板（含培育目标进度条 + 培育期信息）、AI 节能技术推荐、改进建议
  - 数据源改为：根据 `:id` 在 `INITIAL_INCUBATE_DATA` 中查到 `IncubateRecord`，并适配为总览面板所需字段（企业名、信用代码、所属区、行业 / 子行业、产值、得分、专家评分缺省"—"）
  - AI 节能技术推荐部分沿用 `loadResearch / runIncubatorResearch`，以记录的 `creditCode` 为 key
  - 顶部 `AppLayout` 标题：`绿色工厂梯度培育 · {企业名}`，副标题 `本企业培育进展与改进建议`
- 在 `src/App.tsx` 注册新路由 `<Route path="/green-mfg/gov/incubator/:id" element={<GreenMfgGovIncubatorDetail />} />`

## 不改动
- `INITIAL_INCUBATE_DATA` 数据本身、退库 / 晋升 / 导入逻辑
- 企业侧 `GreenMfgEntIncubator.tsx` 与 `incubatorResearchData.ts`
- 其他模块

## 涉及文件
- `src/pages/GreenMfgGovIncubator.tsx`（视角切换、KPI、3 卡片整合、列表精简、跳转改写）
- `src/pages/GreenMfgGovIncubatorDetail.tsx`（新建，复用企业侧三段式布局）
- `src/App.tsx`（注册新路由）
