## 目标

将 `/assets`（固定资产管理）从占位页升级为「普通固定资产投资项目管理模块」原型，包含项目列表页 + 项目详情全量页 + 导入/关联企业弹窗，遵循政务 B 端高信息密度风格，复用现有 shadcn/ui 组件与 `ReportMonthly` 模块的视觉语言。

## 文件结构

```text
src/pages/Assets.tsx                              // 重写：列表页主入口
src/components/assets/                            // 新建目录
  ├─ assetsData.ts                                // 类型 + 25 字段 mock 数据 + 区/对口人/单位性质枚举
  ├─ ProjectDetailView.tsx                        // 详情页（侧边锚点 + 4 分组卡片）
  ├─ ImportDialog.tsx                             // Excel 导入弹窗（下载模板/上传/校验进度/失败明细）
  └─ LinkEnterpriseDialog.tsx                     // 关联企业弹窗（搜索/选择/创建跳转）
```

## 数据模型 (assetsData.ts)

```ts
type LinkStatus = "已关联" | "待关联" | "待确认";
type ProjectType = "新建" | "改建" | "扩建" | "迁建";
type UnitNature  = "央企" | "地方国企" | "民营企业" | "外资企业" | "其他";

interface InvestmentProject {
  // 重点
  id: string; name: string; contact: string;        // 中心对口人
  linkStatus: LinkStatus; linkedEnterpriseCode?: string;
  // 能耗
  approvedEnergy: number;          // 批复年综合能耗（等价值，吨标煤）
  collectedEnergy: number;         // 采集综合能耗（等价值）
  actualSavingTce: number;         // 2025 实际节能量（万吨标煤）
  actualSavingKwh: number;         // 2025 实际节电量（万千瓦时）
  remainingSaving: number;         // 剩余可用节能量（万吨标煤）
  // 项目次要
  district: string; startDate: string; endDate: string;
  investment: number;              // 投资总额（万元）
  projectContact: { name: string; phone: string; email: string };
  projectType: ProjectType; buildingContent: string;
  energyReviewDoc: string; eiaReviewDoc: string; remark: string;
  // 单位
  unitName: string; creditCode: string; industry: string; industryCode: string;
  unitNature: UnitNature;
  unitContact: { name: string; phone: string; email: string };
}
```

Mock：8–10 条覆盖 4 区、3 行业、3 种关联状态、若干「采集 > 批复」预警项。

## 列表页 (Assets.tsx)

- **顶部 KPI 卡片**（3 张）：项目总数 / 本年度累计批复能耗总量（吨标煤求和）/ 本年度累计采集能耗总量（吨标煤求和）。
- **筛选条**：模糊搜索框（项目名称 + 单位名称 OR 匹配）、信用代码精准框、对口人多选下拉（基于 `Popover + Checkbox`），选中多对口人时按对口人分组排序；「重置」按钮。
- **操作区按钮**：`【导入项目】`（打开 ImportDialog）、`【批量导出】`。
- **表格列**：序号、项目名称（点击进详情）、所属单位、所属区、批复年综合能耗、采集综合能耗（若 > 批复 → `text-destructive font-semibold` + AlertTriangle 图标）、关联状态（Badge：绿/橙/黄）、操作（查看 / 关联企业）。
- **详情切换**：复用 ReportMonthly 的"列表 + 右侧详情面板"双栏布局（2xl 屏并排，小屏堆叠）。

## 详情页 (ProjectDetailView.tsx)

**布局**：左侧 sticky 锚点导航（`#key`/`#energy`/`#project`/`#unit`），右侧滚动区分组卡片。每张卡用 `<Card>` + grid（`md:grid-cols-2 xl:grid-cols-3`）。

**顶部操作栏**：项目名称 + 关联状态徽章；右侧按钮 `打印PDF` / `编辑` / 若 `linkStatus !== "已关联"` 显示醒目 `去关联` 按钮（primary 色）。

**字段分组**：

1. **重点信息**：项目编号、项目名称、中心对口人、关联状态（含已关联企业名称）。
2. **能耗数据**（高亮卡片：`border-primary/40 bg-primary/5`）：批复 / 采集 / 节能量 / 节电量 / 剩余可用节能量；每项数值大字号 mono；当 `collected > approved` 时数值红色 + `AlertTriangle` + 文案"已超批复 X 吨标煤"。
3. **次要项目信息**：所属区、开/竣工日期、投资总额、项目联系方式、项目类型（Badge）、建设内容、节能审查批文、环评批文、备注。
4. **单位信息**：单位名称、信用代码、所属区、所属行业 + 代码、单位性质、单位联系人/电话/邮箱。

字段渲染统一组件 `Field({ label, value, highlight?, warn? })`：label 灰小字 + value 等宽字体；warn 时红色。

## 关联企业弹窗 (LinkEnterpriseDialog.tsx)

- 搜索框（企业名称 / 信用代码）；下方结果列表（mock 6 条企业），点击行选中。
- 无结果时显示 `未找到企业，可点击【创建企业】跳转至企业管理模块`，按钮跳转 `/enterprise`。
- 底部 `取消 / 确认绑定`；已关联状态额外显示 `解绑` 按钮。

## 导入弹窗 (ImportDialog.tsx)

- 步骤区：① 下载模板（按钮，mock 提示）② 选择文件（dropzone 样式，限 .xlsx/.xls，10MB 校验）③ 解析进度 `<Progress>` ④ 结果反馈：成功 X 条 / 失败 X 条（提供"下载错误明细"）/ 待关联 X 条。
- 重复冲突区：单选 `覆盖已存在 / 跳过重复`。

## 异常处理 UI

- 列表页：采集 > 批复 → 单元格红色加粗 + 图标。
- 详情页能耗卡片：同上，并补充提示文案。
- 待关联：列表 Badge 橙色，详情顶部显示 `去关联` primary 按钮 + 文案"该项目尚未关联能碳平台企业"。

## 视觉与一致性

- 复用现有 token：`panel`/`text-secondary`/`text-destructive`/`border-primary/40` 等，与 ReportMonthly 模块保持同一风格。
- 状态色映射：已关联 `success`，待关联 `warning/orange`，待确认 `yellow`。
- 表格信息密度高，行高 `h-12`，等宽字体显示数值。

## 不在本次范围

- 真实文件解析、后端接口、权限角色控制、两高项目/节能项目/等量替代/AI 审查等二阶段功能。