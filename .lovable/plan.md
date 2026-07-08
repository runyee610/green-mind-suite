## 登录页再优化：柔化实景背景 + 高级毛玻璃卡片

回到"上海外滩实景照片"作为背景，但通过多层柔化处理去掉之前那种"硬照片"的生硬感，达到通透、温润、企业级美学。

### 背景层做法（软化实景）

保留上传的外滩高清图 `user-uploads://image-68.png`（比 image-65 更亮更蓝，作为主视觉更合适），通过 CSS 分层柔化，不再使用之前的天际线剪影：

1. **重新上传 `login-bg.jpg`**（`lovable-assets create`），删除现有的 `login-skyline.png.asset.json`。
2. 根容器用 `<img>` 铺满：`absolute inset-0 w-full h-full object-cover`，加上 `filter: blur(2px) saturate(0.95) brightness(1.05)`，让照片轻微虚化+提亮，去除锐利质感。
3. 叠加三层柔化蒙版（都在 `absolute inset-0 pointer-events-none`）：
   - 顶部天空提亮：`bg-gradient-to-b from-white/40 via-white/10 to-transparent`
   - 底部白色过渡：`bg-gradient-to-t from-white/70 via-white/25 to-transparent`，让登录卡片区更干净
   - 中心品牌柔光：`radial-gradient(ellipse 55% 45% at 50% 55%, hsl(var(--primary)/0.08), transparent 70%)`

### 前景卡片（毛玻璃）

- `max-w-[420px]` 居中，`bg-white/70 backdrop-blur-2xl border border-white/60`，圆角 `rounded-2xl`
- 阴影用双层柔和高级感：`shadow-[0_1px_2px_rgba(15,23,42,0.06),0_25px_50px_-20px_rgba(15,23,42,0.25)]`
- 内边距 `p-9`，各元素间距上稍加大，通透感

### 卡片内组件微调

- 标题「用户登录」：居中，`text-xl font-medium tracking-[0.28em] text-slate-800`（去掉粗黑体，改为适中字重更"高端"）
- 标题下方细分隔线由主色缩短为 `w-8 h-[2px] bg-primary/60`
- 输入框：`h-11 bg-white/70 border-slate-200/80 focus-visible:border-primary/60 focus-visible:ring-primary/20`，左侧 `UserIcon` / `Lock` 图标线性风格保持不变
- 登录按钮：宽度占满，`h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground tracking-widest shadow-md`（品牌绿已是 emerald 系，与图2 主色一致，不需另外覆盖）
- 记住我 / 忘记密码：低调 `text-xs text-slate-500`

### 左上品牌与页脚（保留但更克制）

- 左上：logo 40×40 白色圆角底 + 「AI 能碳数智空间」`text-xl font-semibold text-slate-800`，副标题英文全大写小字 `text-[10px] tracking-[0.2em] text-slate-500`
- 页脚：底部居中 `text-[11px] text-slate-500/90`，只保留版权文本

### 涉及文件

- 编辑图片资源：
  - 新增 `src/assets/login-bg.jpg.asset.json`（`lovable-assets create --file /mnt/user-uploads/image-68.png --filename login-bg.jpg`）
  - 删除 `src/assets/login-skyline.png.asset.json`（`lovable-assets delete`）
- 编辑 `src/pages/Login.tsx`：改为「实景图 + blur filter + 上下白色渐变蒙版 + 中央品牌光晕」结构，卡片改为更强毛玻璃感

不动业务逻辑、路由、AuthContext、其它页面。
