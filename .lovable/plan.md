## 目标

在政府侧新增一级菜单「企业模拟评价」，方便政府查看辖区企业完成的"模拟自我评价（AI 智能打分）"结果。

## 实现方案

### 1. 模拟数据（共用并扩充 `MOCK_SELF_ASSESS`）

当前企业侧 `GreenMfgEnt.tsx` 中的 `MOCK_SELF_ASSESS` 只有 1 家企业 3 次记录。为了让政府侧列表有内容，将其抽出到 `src/components/green-mfg/data.ts`，扩展为多家企业（例如 6–8 家：上海华普电缆、宝武特种合金、华域汽车电子、申能电力、延锋汽车饰件、华谊新材料等），每家若干次评价，包含字段：`enterpriseName / creditCode / district / industry / date / aiScore / indicatorCount / weakCount`。

企业侧仅展示自己的记录（按当前 `DEFAULT_ENT_NAME` 过滤），保持原有 UI 不变。

### 2. 新增侧边栏菜单（政府侧）

`src/components/AppSidebar.tsx` 的 `greenMfgItemsByRole.gov` 中新增：

```
{ title: "企业模拟评价", url: "/green-mfg/gov/self-assess", icon: ClipboardList }
```

位置：放在"审核推荐"上方（自评价是审核推荐的前置环节）。

### 3. 新增政府侧列表页 `GreenMfgGovSelfAssess.tsx`

- 顶部 KPI：参评企业数 / 评价总次数 / 平均模拟分数 / 薄弱项 ≥5 的企业数
- 列表（按企业聚合，仅展示每家"最新一次"评价）：
  - 列：企业名称 · 所属区 · 行业 · 最近评价日期 · **模拟分数（AI 打分）** · 指标数 · 薄弱项 · 评价次数 · 操作（"详情"）
- 顶部支持企业名称搜索 + 区/行业筛选
- 操作"详情"跳转 `/green-mfg/gov/self-assess/:creditCode`

### 4. 新增政府侧详情页 `GreenMfgGovSelfAssessDetail.tsx`

- 仅展示该企业**最新一次**模拟评价：
  - 企业信息卡（名称、统一信用代码、所属区、行业）
  - 评价摘要卡（评价日期、AI 模拟分数、指标总数、薄弱项数）
  - 指标得分明细 / 薄弱项清单：复用 `src/components/green-mfg/evaluationIndicators.ts` 等现有 mock 指标渲染（与企业侧自评价详情视觉一致，只读）
- 不展示历史多次评价，不提供"重新评价"按钮

### 5. 路由

`src/App.tsx` 新增：

```
<Route path="/green-mfg/gov/self-assess" element={<GreenMfgGovSelfAssess />} />
<Route path="/green-mfg/gov/self-assess/:creditCode" element={<GreenMfgGovSelfAssessDetail />} />
```

## 影响范围

- 新文件：`src/pages/GreenMfgGovSelfAssess.tsx`、`src/pages/GreenMfgGovSelfAssessDetail.tsx`
- 修改：`src/components/AppSidebar.tsx`（新增菜单项）、`src/App.tsx`（新增路由）、`src/components/green-mfg/data.ts`（导出扩充后的 `MOCK_SELF_ASSESS`）、`src/pages/GreenMfgEnt.tsx`（改为引用共享数据并按当前企业过滤）
- 企业侧、培育库、动态管理等其它功能保持不变
