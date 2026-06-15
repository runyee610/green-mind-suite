# 评价指标表 · AI 打分 与 薄弱项预警

在企业侧"模拟自我评价 → 评价指标表（通则）"中新增 **AI 打分** 能力：一键由 AI 智能体根据已上传证明材料自动填充每项指标值，并对薄弱项（得分较低 / 未达基准值 / 证明材料不足）给出醒目提醒，方便企业用户针对性补传材料。

## 范围

- 仅作用于企业侧 `mode="ent"` 的 `EvaluationIndicatorCard`（评价指标表通则）
- 纯前端模拟，不接入真实 AI；满足交互演示
- 不影响政府侧、查看模式、基本要求等其他界面

## 交互设计

### 1. 顶部"AI 打分"按钮
位置：`EvaluationIndicatorCard` 头部右侧，与现有"得分 / 已填 / 已修订"统计并列。

样式与状态：
- 默认态：`<Sparkles>` 图标 + "AI 一键打分"，渐变主色按钮
- 进行中：spinner + "AI 分析中…（约 3s）"，按钮禁用，整卡顶部出现细进度条
- 完成态：按钮变次要样式 "重新 AI 打分"，旁边显示"上次打分 · HH:mm"
- 二次点击前弹确认：若已有部分人工填写，提示"将覆盖未锁定的指标值，是否继续？"（可勾选"仅填充空白项"）

### 2. AI 打分逻辑（前端模拟）
对每个 `IndicatorRow` 按类型生成 `reportValue`：
- **正向定量**：在 `baseValue` 与 `leadValue` 之间随机偏向中位（70% 概率落在 [base, lead] 区间）
- **逆向定量**：反向同理
- **正向定性 / 单选**：从 `reportOptions` 中按权重选一项
- **特殊行**：
  - 序号 1（产品综合能耗，`hasStandard='有'`）：为每条 `products` 行生成 `reportValue`
  - 序号 4（平台功能）：勾选 1–N 项 `platformFunctions`，`reportValue` 同步为数量
- 同步生成一个 `aiMeta`：`{ score: 0-100, weak: boolean, reason: string, suggestedProofs: string[] }`
- 用 1.5–2.5s `setTimeout` 模拟分析过程，分批 setState 形成"逐项点亮"动画感

### 3. 薄弱项识别规则
判定为薄弱项 `weak=true` 的条件（任一即可）：
- 定量：`reportValue` 未达 `baseValue`（与 `type` 方向相关）
- 定性 / 单选：选中非最高档选项
- `proofs.length === 0`（无证明材料）
- AI 评分 < 60

### 4. 薄弱项行内提醒（核心可视化）
在指标行（`updateRow` 渲染区块）下方新增 `WeakHint` 条：
- 仅当 `aiMeta?.weak === true` 时显示
- 样式：左侧 4px 橙色竖条 + 浅橙背景 `bg-warning/10 border-warning/30`
- 内容：`<AlertTriangle>` 图标 + "AI 识别为薄弱项" + 简短原因（如"低于基准值 0.42 tce/t · 建议补充能耗台账"）
- 右侧操作：
  - **补传证明** 按钮 → 复用现有上传入口（高亮证明材料区域，自动滚动并闪烁 2 次）
  - **修正数值** 按钮 → focus 该行 `reportValue` 输入框
  - **忽略** 链接 → 隐藏本行提醒（仅 UI，不修改数据）
- 顶部汇总：卡片标题统计区追加"⚠ 薄弱 N 项"徽章，点击后筛选只展示薄弱项（复用现有 `statusFilter`，新增 `weak` 选项）

### 5. AI 打分结果总览（可选折叠面板）
打分完成后在卡片顶部出现一条可关闭的 `Alert`：
- "AI 已完成 X 项指标打分，识别薄弱项 N 项，建议优先补充以下材料：……（最多列 3 条）"
- "查看完整建议" → 打开右侧 Sheet 展示按一级指标分组的薄弱项清单

## 技术实现

### 文件改动
- `src/components/green-mfg/evaluationIndicators.ts`
  - 给 `IndicatorRow` 增加可选字段：
    ```ts
    aiMeta?: {
      score: number;        // 0-100
      weak: boolean;
      reason: string;       // 简短中文原因
      suggestedProofs?: string[];
      filledAt: string;     // ISO
    };
    ```
- `src/components/green-mfg/aiIndicatorScorer.ts`（新建）
  - 导出 `runAIScoring(rows, opts): Promise<IndicatorRow[]>`
  - 内含定量/定性/特殊行的填充策略与薄弱项判定
  - 支持 `{ overwrite: 'empty' | 'all' }`
- `src/components/green-mfg/DeclarationDetailSections.tsx`
  - 在 `EvaluationIndicatorCard` 头部新增 AI 打分按钮 + 加载态 + 确认 Dialog
  - 在每个指标行渲染块尾部插入 `<WeakHint>` 组件（同文件内定义，避免新增文件）
  - 在 `statusFilter` 增加 `"weak"` 选项及对应过滤逻辑
  - 顶部新增 `Alert` 总览（可关闭）
- `src/pages/GreenMfgEntDeclarationNew.tsx`
  - 无结构改动；`indicators` 状态已通过 `onChange` 接管，AI 结果走相同入口

### 不动的内容
- 政府侧、详情查看模式、基本要求、企业基本信息表
- 草稿存储结构（`aiMeta` 自然随 `indicators` 序列化保存）
- 现有 AI 材料归集面板、AI 打分智能体 Tab

## 验收要点
1. 点击"AI 一键打分" → 2s 内所有空白指标值被填入，输入框高亮一次
2. 薄弱项行下方出现橙色提醒条，原因文案与数值/材料状态吻合
3. 卡片头出现"⚠ 薄弱 N 项"徽章，点击仅显示薄弱项
4. 手动修改某指标值后该行薄弱提醒会按新值实时重算
5. 政府侧打开同一申报详情时，看不到 AI 打分按钮（仅 ent 模式渲染）
