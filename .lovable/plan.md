## 1. "加入培育库" 触发智能体后台调研

文件：`src/pages/GreenMfgEnt.tsx`、新增 `src/components/green-mfg/incubatorResearchData.ts`、`src/pages/GreenMfgEntIncubator.tsx`

- 在 `incubatorResearchData.ts` 中定义：
  - `WeakArea`（薄弱项名称、得分缺口、对应一级维度）。
  - `EnergyTech`（节能技术名称、所属公司/机构、所在地、技术分类、适用薄弱项、预计节能/碳减排收益、成熟度等级 TRL、来源出处+链接、引用日期）。
  - `IncubatorResearchResult`（生成时间、状态：`pending|researching|done`、薄弱项列表、推荐技术列表、调研日志若干条用于"思考过程"展示）。
  - 一份 mock 权威节能技术库（10 条左右，覆盖电缆/线缆行业典型薄弱项：高效电机、永磁同步拉丝机、余热回收、屋顶光伏、能源管控平台、变频空压机、LED+智能照明、绝缘料配方优化、SF6 替代、绿电采购），所属公司使用真实可信的国内/国际知名企业（如 ABB、西门子、施耐德、远景能源、隆基绿能、宁德时代、海尔卡奥斯、上海电气、亨通光电等）+ 来源链接（官网/工信部/节能中心/IEA）。
  - 导出 `runIncubatorResearch(weakAreas)`：模拟 deepthink + deep research 的多阶段过程（解析薄弱项 → 全网检索 → 权威性筛选 → 收益估算 → 输出建议），分 4-5 个阶段 setTimeout 推进，每阶段写入日志；最终基于薄弱项匹配技术库返回 5-8 条推荐。
  - 使用 localStorage key `green-mfg-incubator-research`（按企业 creditCode 存）持久化结果，供梯度培育页加载。

- `GreenMfgEnt.tsx` "加入培育库" 按钮点击：
  - 仍校验至少 1 次 AI 打分。
  - 通过 `MOCK_SELF_ASSESS[0].weakCount` + 当前企业评分数据生成 `weakAreas`（mock：取最低的 3 个二级维度名称作为薄弱项）。
  - 立刻写入一条 `status: "researching"` 的记录到 localStorage，然后 `runIncubatorResearch` 异步推进直至 `done`。
  - toast 提示"已加入区级培育库，AI 智能体正在后台检索节能技术…"；提供"查看培育进展"按钮跳 `/green-mfg/ent/incubator`。

## 2. 梯度培育页 (`GreenMfgEntIncubator.tsx`)

- **删除** "各维度得分情况" 整张 Card（含 `ScoreBreakdown` 引用）。
- **企业基础信息卡 InfoTile 调整**：
  - 删除：`自我评价批次`、`责任审核员`。
  - 重命名：`提交时间` → `模拟时间`；`智能打分` → `模拟自评价得分`；`专家审核` → `区级专家评分`。
  - 新增：`市级专家评分`。
  - 任何缺数据的字段统一显示 `—`（含模拟自评价得分、区级/市级专家评分等）。
- **新增 "AI 节能技术推荐" 卡片**（替代被删除的维度得分卡位置）：
  - 顶部展示智能体状态：研究中显示加载动画 + 实时日志（"正在解析薄弱项…/检索权威技术库…/匹配 ABB 高效电机方案…"），研究完成显示"已完成全网检索，共推荐 N 项成熟技术"。
  - 主体：网格卡片，每条技术展示：技术名称（大字）、所属公司 + Logo 占位、技术分类 Badge、适用薄弱项 Badge、预计节能收益、成熟度 TRL、来源链接（外链）、引用日期。
  - 顶部右侧"重新调研"按钮：重跑 `runIncubatorResearch`。
  - 无数据（首次进入未加入）显示空态："请先在「模拟自我评价」页点击「加入培育库」启动智能体调研。"
- **改进建议** 卡片保留但下沉到底部，建议条目由 AI 推荐技术动态生成（"建议引入 {技术名} —— {公司}，预计 {收益}"），保留 1 条审核意见占位。

## 3. 数据来源说明

- 节能技术 mock 数据：手工整理 10 条真实存在的方案（来自 IEA TCEP、工信部《国家工业和信息化领域节能技术装备推荐目录》、各企业公开案例），仅用于演示，不调用真实网络。
- 调研流程纯前端模拟（setTimeout + 进度日志），不引入 Lovable Cloud 或第三方 API；若后续要接入真实 deep research，再扩展为 Edge Function 调用 Lovable AI Gateway。

## 影响范围

- 新增：`src/components/green-mfg/incubatorResearchData.ts`
- 修改：`src/pages/GreenMfgEnt.tsx`（"加入培育库" 逻辑）
- 修改：`src/pages/GreenMfgEntIncubator.tsx`（删除维度得分卡 + 字段重命名 + 新增 AI 技术推荐卡 + 改进建议联动）
