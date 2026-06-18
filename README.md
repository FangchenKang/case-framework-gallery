# Case Framework Gallery

一个本地可运行的案例框架图库项目，用于储存、检索和复用案例比赛与学术汇报中的框架图。项目第一阶段定位为“案例框架图仓库”，不包含复杂在线绘图功能。

在线访问地址：[https://FangchenKang.github.io/case-framework-gallery/](https://FangchenKang.github.io/case-framework-gallery/)

## 功能

- 图库式首页展示框架图卡片
- 按研究主题和图形类型筛选
- 按标题、说明、适用场景、关键词、引用来源、备注和讲解句式进行前端搜索
- 点击卡片查看大图预览、说明、场景、关键词和文件格式
- 支持下载 SVG、PNG、JPG 图片
- SVG 图形支持复制 SVG 源代码
- 上传本地 PNG、JPG、JPEG、SVG 图形并保存到浏览器本地图库
- 支持导出和导入本地图形 JSON 备份
- 本地上传图形可删除，示例图形不可删除

## 运行命令

```bash
npm install
npm run dev
```

开发服务器启动后，按照终端显示的本地地址打开网页即可。

## 上传图形

进入顶部导航的“上传图形”页面后，可以点击上传区或拖拽上传图片。当前支持 `PNG`、`JPG`、`JPEG`、`SVG`，建议单个文件控制在 10MB 以内。

上传后填写标题、研究主题、图形类型、适用场景、关键词、简短说明等信息，再点击“保存到图库”。保存成功后，图形会出现在图库首页，并带有“本地上传”标识。

“引用来源”字段是一个多行文本框，不拆分作者、年份、期刊或链接。你可以直接粘贴完整参考文献格式，例如中文国标格式、APA、Chicago、论文标题 + 作者 + 期刊、网址、书籍信息或会议论文信息。如果暂时不知道来源，可以留空。

## 本地数据与备份

当前版本不包含账号登录、后端数据库或云端存储。上传图形和标注信息会保存到当前浏览器的 IndexedDB 本地存储中。

如果清理浏览器数据、更换浏览器或更换电脑，本地图库可能无法自动同步。重要图库请定期点击“导出图库数据 JSON”进行备份；需要恢复时，使用“导入图库数据 JSON”即可。

未来版本可以继续升级为账号登录、云端同步、多人共享图库和在线编辑。

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
   │  ├─ SearchBar.tsx
   │  ├─ TopNavigation.tsx
   │  ├─ UploadPage.tsx
   │  └─ UsageGuidePage.tsx
   ├─ data/
   │  ├─ frameworks.ts
   │  └─ localFrameworks.ts
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

当前组件已按 Header、SearchBar、FilterTabs、FrameworkCard、FrameworkModal、GalleryGrid、UploadPage 等模块拆分，后续可以继续增加收藏、比赛项目分组、在线编辑标题文字、导出 PPT 页面、账号登录和云端同步等功能。
