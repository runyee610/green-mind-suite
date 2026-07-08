## 登录页背景柔化方案

参考图的效果：上方是干净的浅蓝天空渐变，中下部才浮现天际线剪影，底部再淡出为白色，整体轻盈通透，而非一张硬照片铺满。

### 实现思路

用「渐变天空 + 抠出天际线的图」叠加来复刻这种效果，而不是直接铺原图。

#### 步骤 1：生成一张天际线剪影 PNG（透明背景）
用 `imagegen--edit_image` 处理已上传的外滩图 `user-uploads://image-65.png`：
- prompt：保留城市天际线主体，去除天空与水面，只留下城市剪影，边缘向下自然羽化淡出到透明；输出干净透明背景
- `transparent_background: true`
- 保存到 `src/assets/login-skyline.png`
- 通过 `lovable-assets` 上传为 `src/assets/login-skyline.png.asset.json`
- 移除原来的 `src/assets/login-bg.jpg.asset.json`（用 `lovable-assets delete` 清理 CDN 对象）

#### 步骤 2：重写 `src/pages/Login.tsx` 背景层
把当前"整张背景图 + 深色遮罩"替换为三层结构：

```
┌──────────────────────────────────────────┐
│  纯色/渐变天空                             │  ← 底层：from-sky-50 via-white to-white
│    ┌──────────────────────────────┐      │
│    │      柔和光晕（径向渐变）        │      │  ← 中层：品牌绿在卡片背后做 soft glow
│    └──────────────────────────────┘      │
│  ▁▂▃ 天际线剪影贴底，顶部渐隐 ▃▂▁          │  ← 顶层：skyline PNG，bottom-0，透明度约 55%
└──────────────────────────────────────────┘
```

关键 class：
- 根容器：`bg-gradient-to-b from-sky-100 via-white to-white`
- 中层光晕：`absolute inset-0` + `bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.10),transparent_60%)]`
- 天际线：`<img>` 绝对定位 `bottom-0 left-0 right-0 w-full h-[55vh] object-cover object-bottom opacity-60`，再叠一层 `bg-gradient-to-b from-white via-transparent to-white` 让它顶部虚化、底部融入卡片区

#### 步骤 3：品牌区与卡片配色随背景调整
背景不再是深色照片，需要把之前依赖深色的白色文字改成深色：
- 左上「AI 能碳数智空间」：`text-slate-800`，副标题 `text-slate-500`，logo 底改 `bg-white shadow-md ring-1 ring-slate-200`
- 页脚小字：`text-slate-500`
- 登录卡片：`bg-white/85 backdrop-blur-xl border-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)]`，主色分隔条与按钮保持不变

### 涉及文件
- 新增 `src/assets/login-skyline.png.asset.json`（透明天际线，来自图片编辑）
- 删除 `src/assets/login-bg.jpg.asset.json`（原始外滩硬照片不再使用）
- 编辑 `src/pages/Login.tsx`：改背景层、字色、卡片阴影

登录业务逻辑、路由、AuthContext 完全不动。
