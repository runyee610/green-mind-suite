## 目标
在专家评审 → 市级视角的申报详情页也显示"加入培育库"按钮，点击后加入市级培育库（区级视角保持原逻辑加入区级培育库）。两级视角的"已加入"状态互相独立。

## 修改内容

### `src/pages/GreenMfgGovDeclarationDetail.tsx`
1. 将当前的单一 `JOINED_KEY = "green-mfg-incubator-joined"` 拆分为两个键：
   - `green-mfg-incubator-joined-district`
   - `green-mfg-incubator-joined-city`
   根据 `view` 变量选择对应键，`district` / `city` 的加入状态互不干扰。
2. `handleJoinIncubator`：写入当前视角对应的键；toast 文案根据 view 显示"已将「xxx」加入区级培育库"或"已将「xxx」加入市级培育库"。
3. 渲染按钮的条件从 `!isIncubator && view === "district"` 改为 `!isIncubator`，使市级视角也显示按钮。按钮 label/icon 保持："加入培育库" / "已加入培育库"。
4. `useEffect` 读取 `joined` 状态时，依赖项加入 `view`，切换视角能正确刷新。

## 备注
- 培育库页面（`GreenMfgGovIncubator.tsx`）目前使用组件内 `useState(INITIAL_INCUBATE_DATA)`，不读该 localStorage 键，因此此处仅在详情页维持"已加入"的按钮状态，与既有区级行为保持一致；不改动培育库数据源。
