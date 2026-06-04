## 目标

在企业侧填报/复评流程中，"AI 打分智能体"之后新增一步 **数据确权**：企业必须勾选承诺后方可提交审核；政府侧详情页同步展示该确权结果（只读）。

## 实施

### 1. 新组件 `src/components/green-mfg/DataAttestationPanel.tsx`

可复用面板，两种模式：

- `mode="ent"`（默认）：可交互
  - 顶部说明卡：标题"数据确权与法律责任承诺"，简述 AI 打分仅辅助、最终由企业认可。
  - 承诺清单（4 项 Checkbox）：
    1. 所提交的企业信息、指标数据、证明材料真实、完整、有效；
    2. 已对各项证明材料进行核对，与系统填报内容一致；
    3. 认可 AI 智能体的辅助打分结果，并以此作为本次自评依据；
    4. 如有虚假填报或材料造假，自愿承担相应法律责任。
  - 法定代表人 / 经办人姓名 + 确权日期（自动取今日，可改）。
  - 底部"确认承诺"按钮，点击后写入 `localStorage`（key 同草稿，新增 `attestation` 字段），并 toast。
  - 通过 `onConfirmedChange(confirmed: boolean)` 上抛状态，供父页控制"提交审核"按钮启用。
- `mode="gov"`：只读
  - 展示承诺人、确权时间、4 条承诺勾选状态（全部 ✅），以及"企业已完成数据确权"徽标。
  - 若企业未确权（mock 中默认已确权），显示"待企业确权"。

### 2. 企业侧填报/复评页

`src/pages/GreenMfgEntDeclarationNew.tsx` 与 `src/pages/GreenMfgEntReviewNew.tsx`：

- `ANCHORS` 末尾新增 `{ href: "data-attestation", label: "数据确权" }`。
- 渲染新 step：`<DataAttestationPanel mode="ent" onConfirmedChange={setAttestationConfirmed} initial={draft.attestation} />`。
- 顶部和底部"提交审核"按钮在 `attestationConfirmed !== true` 时 `disabled`，并 tooltip/toast 提示"请先完成数据确权"。
- 草稿 `DraftPayload` 增加 `attestation?: { confirmed; signer; signedAt; checks: boolean[] }` 字段，保存/恢复时一并处理。

### 3. 政府侧详情页 `src/pages/GreenMfgGovDeclarationDetail.tsx`

- `TABS` 在"AI 打分结果"之后新增 `{ value: "data-attestation", label: "数据确权" }`。
- 对应 `<TabsContent>` 渲染 `<DataAttestationPanel mode="gov" />`（mock：已确权，签署人=detail 联系人，签署时间=detail.submitDate，4 项全勾）。

### 4. 企业侧详情页 `src/pages/GreenMfgEntDeclarationDetail.tsx`

- 同步新增"数据确权"Tab，以 `mode="gov"`（只读回显）展示，与政府侧一致。

不改动 AI 打分组件、业务数据模型、路由。
