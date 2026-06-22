## 修改 `src/pages/GreenMfgEntDeclarationNew.tsx`

### 1. 移除"评价批次"
- 删除顶部操作栏中"评价批次" Label + Select（连同 `BATCH_OPTIONS` 常量）
- 删除 `batch` state 及其 setter
- 从 `DraftPayload` 接口移除 `batch` 字段
- `handleSave` 中不再写入 batch
- `useEffect` 草稿恢复逻辑中移除 `setBatch(...)`
- 移除未使用的 `Label`、`Select*` 等 import（如不再被其它处使用）

顶部操作栏左侧改为空（或仅保留草稿保存时间，将"草稿已保存"移到左侧），右侧保留返回/保存按钮。

### 2. 重排子tab顺序
将 `ANCHORS` 调整为：
```
1. basic-requirements    基本要求
2. evaluation-indicator  评价指标表（通则）
3. basic-info            企业基本信息表
4. ai-scoring            AI 打分结果
```

渲染分支按新的 href 渲染对应内容（逻辑不变，仅顺序调整）：
- `basic-requirements` → AIMaterialIntakePanel + BasicRequirementsCard
- `evaluation-indicator` → AIMaterialIntakePanel + EvaluationIndicatorCard
- `basic-info` → EnterpriseBasicInfoCard
- `ai-scoring` → AIScoringAgentPanel

`currentStep` 初始值仍取 `ANCHORS[0].href`（即新的"基本要求"）。上一步/下一步逻辑基于 ANCHORS 顺序自动生效，无需改动。
