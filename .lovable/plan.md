
# 免审即享模块全面升级

围绕 7 项需求，将"免审即享"打造成以**对话式智能体 + 政务级数据确权证书**为核心的全链路原型，所有信息以**单页详情**呈现，便于截图。

## 一、设计核心：政务风数据确权证书

新建 `DataCertificate` 组件，作为贯穿整个模块的「凭据载体」。

视觉规范（政务公文风）：
- 米色证书底（`#f7f1e2` 渐变到 `#fcf8eb`），双层深红边框 (`hsl(0 65% 35%)`)，四角放射性印纹
- 顶部红头 + 国徽风 SVG（用 `Shield + Star` lucide 组合 + 五角星）
- 中央竖排标题"数据确权证书"，证书编号 `CERT-{年}-{6位}`
- 正文：确权主体（企业）、确权数据项（含原始字段、数值、采集时间、签发机构）
- 底部：钢印效果（红色 SVG 圆形章 "上海市数据要素登记中心"）、签发日期、区块链存证哈希（mock）
- 防伪：背景水印 "DATA·CERT"，右下角二维码 SVG

数据模型新增（`directBenefitData.ts`）：
```ts
export interface DataCertificate {
  id: string;            // CERT-2026-000138
  enterpriseId: string;
  issuer: string;        // "上海市数据要素登记中心"
  issuedAt: string;
  hash: string;          // 0x9a3f...e2c1
  items: {
    label: string;       // 例如"年节能量"
    value: string;
    source: string;      // 来自哪个表
    collectedAt: string;
    fieldPath: string;   // 报表.字段
  }[];
  scope: string[];       // 授权用途
}
```

每家企业生成 1 张主证书（聚合其全部画像维度），每条 match 关联用到的 `certificateId` 与具体 `itemKeys`。

组件目录：
- `src/components/direct-benefit/DataCertificate.tsx` — 完整大版（详情页用）
- `src/components/direct-benefit/DataCertificateMini.tsx` — 紧凑卡片（列表用，显示编号+签发机构+确权项数+查看按钮）

## 二、对话式智能体工作台（需求 1）

**改造 `src/pages/DirectBenefit.tsx`**：移除 KPI 栅格、工作流时间轴、动态 Feed、QuickLink 网格；改为**单页对话流**。

布局（一屏内全展示）：
- 左侧（260px）：会话列表 + 「智能体能力面板」（4 步工作流芯片、数据源状态、置信度概览，全部只读小卡）
- 中间主区：聊天滚动区 + 底部输入框
- 不使用抽屉，关键内容均以「卡片消息」形式落在对话里

消息类型（智能体气泡内内联渲染）：
- `text` — 普通回复
- `policy-list` — 政策卡片缩略（点击进政策详情页）
- `match-table` — 撮合命中表（条件 ↔ 证据），政府侧带「批准/驳回/推送」按钮
- `enterprise-profile` — 画像 → 直接渲染 `DataCertificateMini`
- `disburse-status` — 拨付时间轴卡
- `agent-action` — "我已抓取 3 项新政策" 类操作日志气泡（带置信度 chip）

预置快捷指令（chip 按钮，点击发送）：
- 政府侧："今日新增政策" / "本周高置信撮合" / "拨付进度" / "配置数据源"
- 企业侧："我适用哪些政策" / "我的数据确权证书" / "我的资金到账"

技术：纯前端 mock，输入触发 `setTimeout` + 预设回复脚本，无需真 LLM。所有现有 KPI/工作流数据通过「能力面板」卡片在左栏静态展示，保留透明化。

## 三、数据源配置（需求 2）

新增 `src/pages/DirectBenefitDataSources.tsx`（政府侧），路由 `/direct-benefit/gov/sources`。

数据模型新增：
```ts
export interface DataSource {
  id: string; name: string;          // 例如"市经信委政策库"
  category: "政策渠道" | "企业数据" | "监管数据";
  endpoint: string;                  // mock URL
  refreshCron: string;               // "每日 02:00"
  status: "已连接" | "异常" | "暂停";
  lastSync: string; recordCount: number;
  owner: string;                     // 主管部门
  fieldsMapped: number;              // 字段映射数量
}
```

页面（单页内含 4 块，不用抽屉）：
1. 顶部 KPI：源数、今日同步条数、异常数
2. 数据源表格（增删/编辑/启停/立即同步），点击行下方**就地展开**编辑面板（不弹窗）
3. 同步日志面板（最近 10 条）
4. 字段映射规则（mock JSON 预览 + 复制）

侧边栏增加该入口。

## 四、企业画像 → 数据确权证书（需求 3）

改造 `src/pages/DirectBenefitEntProfile.tsx`：
- 列表表格保留，但「画像维度」列改为「确权证书编号」+ 「确权项数」
- 点击行不再开抽屉，**跳转到 `/direct-benefit/gov/entprofile/:id` 详情页**
- 新建详情页 `DirectBenefitEntProfileDetail.tsx`：
  - 顶部企业信息条
  - 中部大幅 `DataCertificate`（A4 比例展示）
  - 下方「已匹配政策」表 + 「证书使用记录」（哪些撮合/拨付引用了本证书）

## 五、企业侧「一键确认申领」加证书（需求 4）

改造 `src/pages/DirectBenefitClaim.tsx`：
- 在「A. 条件命中清单」上方插入 `DataCertificateMini` + 一句 "本次申领将引用以下数据确权证书"
- 「A. 条件命中清单」表格新增「确权项」列，把每条 evidence 对应到证书 item
- 不改抽屉（本页本就是详情页）

## 六、企业侧「资金到账」多笔 + 引用证书与政策（需求 5）

改造 `src/pages/DirectBenefitDisburse.tsx` 企业侧分支：
- 已是列表，扩充每张卡片：
  - 卡片头：金额 + 状态徽章
  - 中段：**「匹配政策」区**（政策名、文号、撮合置信度）
  - **「引用的数据确权证书」区**（`DataCertificateMini`，可点开证书详情页）
  - 时间轴（保留）
  - 凭证下载（保留）
- 在 `Disbursement` 数据上补 `certificateId`、`usedCertItemKeys`
- 增加 mock 数据 D003、D004，让企业侧能看到多笔（已到账 / 划拨中 / 已核准 各一笔）

## 七、抽屉全部改为详情页（需求 7）

清单（移除 Sheet/Drawer，改 `useNavigate` 进新路由）：

| 位置 | 现状 | 改造 |
|---|---|---|
| `DirectBenefitMatches.tsx` 撮合详情 | Sheet | 跳 `/direct-benefit/gov/matches/:id` → 新 `DirectBenefitMatchDetail.tsx` |
| `DirectBenefitEntProfile.tsx` 企业画像 | Sheet | 跳 `/direct-benefit/gov/entprofile/:id` → 新 `DirectBenefitEntProfileDetail.tsx` |
| `DirectBenefitPolicies.tsx` 推送 Dialog | Dialog | 跳 `/direct-benefit/gov/policies/:id` → 新 `DirectBenefitPolicyDetail.tsx`（含推送操作） |
| Claim / Disburse | 已是详情页 | 内容扩充即可 |

新详情页统一布局：一页平铺 4-6 个 section，信息密度高、无折叠，便于截图。

## 八、路由与导航

`src/App.tsx` 新增：
```
/direct-benefit/gov/sources
/direct-benefit/gov/policies/:id
/direct-benefit/gov/matches/:id
/direct-benefit/gov/entprofile/:id
```

`AppSidebar.tsx` 政府侧免审即享分组追加「数据源配置」。

`AppLayout.tsx` 面包屑追加新路由映射。

## 文件变更清单

新增：
- `src/components/direct-benefit/DataCertificate.tsx`
- `src/components/direct-benefit/DataCertificateMini.tsx`
- `src/components/direct-benefit/AgentChat.tsx`（对话主体）
- `src/components/direct-benefit/AgentChatMessages.tsx`（各种消息渲染器）
- `src/pages/DirectBenefitDataSources.tsx`
- `src/pages/DirectBenefitPolicyDetail.tsx`
- `src/pages/DirectBenefitMatchDetail.tsx`
- `src/pages/DirectBenefitEntProfileDetail.tsx`

改造：
- `src/pages/DirectBenefit.tsx`（彻底重写为对话工作台）
- `src/pages/DirectBenefitMatches.tsx`（移除 Sheet，行跳详情页）
- `src/pages/DirectBenefitEntProfile.tsx`（移除 Sheet，列改证书号，行跳详情页）
- `src/pages/DirectBenefitPolicies.tsx`（推送 Dialog 改跳详情页）
- `src/pages/DirectBenefitClaim.tsx`（嵌入证书 + 确权项列）
- `src/pages/DirectBenefitDisburse.tsx`（企业侧卡片扩充政策 + 证书；新增 mock 数据）
- `src/components/direct-benefit/directBenefitData.ts`（新增 `DataCertificate`、`DataSource` 类型与 mock；为 match/disbursement 补 `certificateId`、`usedCertItemKeys`；多 1-2 笔企业侧拨付）
- `src/components/AppSidebar.tsx`（加「数据源配置」入口）
- `src/components/AppLayout.tsx`（面包屑）
- `src/App.tsx`（4 条新路由）

废弃：`AgentStatusBar.tsx` 暂不删除（作为对话工作台左侧能力面板的素材引用），后续如不再使用可清理。
