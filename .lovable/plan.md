## 目标

在左侧栏新增"免审即享"模块（独立分组），用 AI 智能体形态承载"数据筛查 → 名单推送 → 信息确认 → 资金直达"业务闭环。同时支持政府侧（市/区发改、经信、市场监管）与企业侧两套视图，并贯彻 AI 透明化原则（来源可溯、决策可解释、过程可追溯）。

## 信息架构

左侧栏新增分组「免审即享」，图标 `Wallet`/`Coins`：

政府侧：

- 智能体工作台 `/direct-benefit/gov` — 总览全市撮合情况
- 政策图谱 `/direct-benefit/gov/policies` — 智能体抓取的政策清单 + 适用条件解析
- 企业画像 `/direct-benefit/gov/entprofile`— 智能体综合企业数据生成企业画像
- 撮合名单 `/direct-benefit/gov/matches` — 企业-政策匹配结果与公示/推送
- 资金拨付 `/direct-benefit/gov/disburse` — 已确认待拨付/已拨付台账

企业侧：

- 我的专属政策 `/direct-benefit/ent` — 智能体推荐的政策卡片（一目了然）
- 申领与确认 `/direct-benefit/ent/claim/:id` — 政策详情+企业画像核对+收款账户确认
- 资金到账 `/direct-benefit/ent/funds` — 拨付进度时间轴

核心支持领域聚焦三类：工业节能技术改造 / 既有建筑节能改造 / 能耗在线监测建设（用于全局筛选与配色）。

## 关键页面设计

### 1. 智能体工作台（政府侧 + 企业侧顶部都复用同一组件，但内容不同）

顶部"AI 智能体状态条"（透明化核心）：

- 智能体名称："免审即享智能体"，运行状态（运行中/休眠）、上次运行时间、覆盖政策数/匹配企业数
- 三个步骤进度芯片：政策采集 → 画像生成 → 匹配推荐（每个可点击展开"它做了什么"）

政府侧四张 KPI 卡（信息克制）：

- 在库政策、待公示名单、待企业确认、本月已拨付金额

企业侧四张 KPI 卡：

- 智能体为我匹配的政策数、待我确认、审批中、累计到账资金

下方左右双栏：

- 左：智能体工作流时间轴（4 步），每步显示数据来源、产出物、可信度分数
- 右：今日动态 Feed（如"识别 3 项新政策""为 12 家企业新增匹配"）

### 2. 政策图谱（政府侧） / 我的专属政策（企业侧）

卡片网格，每张政策卡：

- 顶部标签：领域（节能技改 / 建筑节能 / 能耗监测）+ 资金额度区间
- 政策名称、发文单位、截止日期
- 「智能体解读」折叠区：申报条件结构化解析（条件项 ✓/✗ 命中状态）、资助额度计算口径、申报指引步骤
- 来源链接（透明：可跳转原文）+ 抓取时间 + 解析置信度（用进度条/百分比表示）
- 政府侧操作：发布公示 / 点对点推送 / 编辑匹配规则
- 企业侧操作：查看匹配理由 / 一键确认申领

筛选器：领域、资金区间、截止时间、状态。

### 3. 撮合名单（政府侧）

表格：企业名称、信用代码、匹配政策、命中条件数/总条件数、智能体置信度、画像数据来源（标签云：节能月报/能耗限额/温室气体/绿色工厂/技改项目等）、状态（待公示/已公示/已推送/企业已确认/已拨付/驳回）。

点击行 → 抽屉：

- 企业画像摘要（透明：每个画像维度都标注"数据来自 XX 报表 / 更新于 XX"）
- 匹配解释（条件 ↔ 数据 一一对应表）
- 操作：批准公示、点对点推送、驳回（需填写理由）

### 4. 申领与确认（企业侧）

三段式：

- A. 政策摘要（条件命中清单 + 资助额度估算）
- B. 企业基础信息核对（自动带入，可申请修正，每个字段标"来源 + 时间"）
- C. 收款账户确认（开户行、账号、对公账户验证状态）+ 法人意愿确认勾选项
- 提交后跳"等待资金直达"状态页

### 5. 资金拨付 / 资金到账

政府侧：拨付台账表 + 月度拨付趋势小图 + 单笔可下钻看流水
企业侧：单笔到账时间轴（已核准 → 财政划拨 → 已到账），含拨付凭证 PDF 预览入口

## AI 透明化设计要点（贯穿所有页面）

1. 每条 AI 产出物都附"来源徽章"+"生成时间"+"置信度"
2. 匹配结果提供"可解释面板"：条件 vs 企业数据逐项对照
3. 智能体行为日志：侧边可调出"智能体最近做了什么"Drawer
4. 数据画像每个维度可点击 → 跳转原始报表
5. 所有自动决策保留"人工复核"入口（政府侧）和"申诉/修正"入口（企业侧）

## 视觉与组件

- 沿用现有 shadcn + 设计令牌，强调绿色+金色（资金）双色调
- 智能体相关元素统一使用 `Brain` / `Sparkles` / `Wallet` 等 lucide 图标 + 微妙的呼吸光晕
- 表格走现有 `Table`，详情走 `Sheet` 抽屉避免页面跳转过多
- 不引入新依赖；动效用 tailwind 已有的过渡类即可

## 技术实现

新增文件：

```
src/pages/DirectBenefit.tsx                       # 工作台（按 role 渲染）
src/pages/DirectBenefitPolicies.tsx               # 政策图谱（gov）/ 专属政策（ent）
src/pages/DirectBenefitMatches.tsx                # 撮合名单（gov）
src/pages/DirectBenefitClaim.tsx                  # 申领与确认（ent）
src/pages/DirectBenefitDisburse.tsx               # 资金拨付（gov） / 资金到账（ent）
src/components/direct-benefit/AgentStatusBar.tsx  # 顶部智能体状态条
src/components/direct-benefit/AgentWorkflow.tsx   # 4 步工作流时间轴 + 透明化弹层
src/components/direct-benefit/PolicyCard.tsx      # 政策卡（含智能体解读折叠）
src/components/direct-benefit/MatchExplainPanel.tsx # 匹配解释面板
src/components/direct-benefit/EnterpriseProfileChips.tsx # 画像来源徽章
src/components/direct-benefit/directBenefitData.ts # mock 数据：政策、企业、匹配、拨付
```

修改：

- `src/components/AppSidebar.tsx`：新增 `directBenefitItemsByRole` 分组与图标
- `src/App.tsx`：注册 5 条新路由（政府/企业按 role 在页面内分支或共用页面）

数据 mock 策略：所有 mock 数据放 `directBenefitData.ts`，字段包含 `source`、`generatedAt`、`confidence`、`evidence[]`，确保透明化所需字段在数据层就齐备。

不改动业务逻辑/数据库（纯前端展示原型）。