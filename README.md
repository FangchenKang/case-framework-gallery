# Case Framework Gallery

一个本地可运行的案例框架图库项目，用于储存、检索和复用案例比赛与学术汇报中的框架图。项目第一阶段定位为“案例框架图仓库”，不包含复杂在线绘图功能。

在线访问地址：[https://FangchenKang.github.io/case-framework-gallery/](https://FangchenKang.github.io/case-framework-gallery/)

## 功能

- 图库式首页展示框架图卡片
- 按图形类型筛选：机制图、时间轴、左右结构、封面图、总结页、理论框架
- 按标题、说明、适用场景和关键词进行前端搜索
- 点击卡片查看大图预览、说明、场景、关键词和文件格式
- 支持下载 SVG、PNG、JPG 图片
- SVG 图形支持复制 SVG 源代码

## 运行命令

```bash
npm install
npm run dev
```

开发服务器启动后，按照终端显示的本地地址打开网页即可。

## 技术栈

- React
- Vite
- TypeScript
- 普通 CSS 组件样式
- 本地 SVG/PNG/JPG 静态资源

## 项目结构

```text
case-framework-gallery/
├─ index.html
├─ package.json
├─ README.md
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ src/
   ├─ App.tsx
   ├─ main.tsx
   ├─ vite-env.d.ts
   ├─ assets/
   │  └─ frameworks/
   │     ├─ competition-cover-template.svg
   │     ├─ event-security-tiered-governance.svg
   │     ├─ four-stage-adaptive-governance.svg
   │     ├─ high-conflict-policy.svg
   │     ├─ nested-public-private-tiaokuai.svg
   │     └─ problem-mechanism-result.svg
   ├─ components/
   │  ├─ AddFrameworkGuide.tsx
   │  ├─ FilterTabs.tsx
   │  ├─ FrameworkCard.tsx
   │  ├─ FrameworkModal.tsx
   │  ├─ GalleryGrid.tsx
   │  ├─ Header.tsx
   │  └─ SearchBar.tsx
   ├─ data/
   │  └─ frameworks.ts
   └─ styles/
      └─ global.css
```

## 新增图形说明

1. 把新的图片文件放入 `src/assets/frameworks`，支持 `svg`、`png`、`jpg`。

2. 在 `src/data/frameworks.ts` 中引入图片并新增一条记录。

SVG 示例：

```ts
import newFrameworkSvg from '../assets/frameworks/new-framework.svg';
import newFrameworkSource from '../assets/frameworks/new-framework.svg?raw';

{
  id: 'new-framework',
  title: '新的框架图标题',
  type: '机制图',
  scene: '适用场景说明',
  description: '一句简短说明',
  tags: ['基层治理', '政策执行'],
  imagePath: newFrameworkSvg,
  fileType: 'svg',
  svgSource: newFrameworkSource,
}
```

PNG/JPG 示例：

```ts
import newFrameworkPng from '../assets/frameworks/new-framework.png';

{
  id: 'new-framework',
  title: '新的框架图标题',
  type: '总结页',
  scene: '适用场景说明',
  description: '一句简短说明',
  tags: ['风险治理', '综合治理'],
  imagePath: newFrameworkPng,
  fileType: 'png',
}
```

3. 重新运行网页或刷新开发服务器页面，新的图形会自动出现在图库中。

## 后续扩展方向

当前组件已按 Header、SearchBar、FilterTabs、FrameworkCard、FrameworkModal、GalleryGrid 等模块拆分，后续可以继续增加收藏、比赛项目分组、备注、标题在线编辑、导出 PPT 页面等功能。
