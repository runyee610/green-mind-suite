## 登录页顶部调整

仅修改 `src/pages/Login.tsx`，不动其它文件与业务逻辑。

### 1. 左上角品牌区
- 删除英文副标题 `AI+ Trusted Energy-Carbon Smart Data Space`
- 保留 Logo + "AI 能碳数智空间" 主标题

### 2. 右上角新增"绿色制造体系"入口
在页面右上角 (`absolute top-6 right-8 z-10`) 新增一个模块，与左上角品牌视觉对称：

- 标题：**绿色制造体系**（绿色主题色，字号与左侧主标题接近，带一个小型叶子/环保线型图标，例如 lucide 的 `Leaf`）
- 下方以横向排列展示三个子能力，每个为轻量胶囊/标签样式（毛玻璃底 + 细边 + 小图标）：
  - **申报**（图标：`FileText`）
  - **专家评审**（图标：`UserCheck`）
  - **智能体**（图标：`Bot`）

样式基调与现有卡片一致：`bg-white/70 backdrop-blur border border-white/70`、圆角、柔和阴影、slate 文本、primary 绿色点缀，保证与整体极简毛玻璃风一致，不打破画面通透感。

### 技术细节
- 从 `lucide-react` 追加导入 `Leaf, FileText, UserCheck, Bot`
- 新增结构大致：
  ```text
  <div className="absolute top-6 right-8 z-10 ...">
    <div>  Leaf + 绿色制造体系  </div>
    <div className="mt-2 flex gap-2">
      [胶囊: 申报]  [胶囊: 专家评审]  [胶囊: 智能体]
    </div>
  </div>
  ```
- 颜色统一使用语义 token（`text-primary`、`bg-white/70` 等），不写死颜色。

### 不改动
- 背景图、遮罩、居中登录卡片、表单、页脚
- AuthContext、路由、其它页面
