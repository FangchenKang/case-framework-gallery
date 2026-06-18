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
- 可通过 Vercel serverless API 将本地图形同步到 GitHub 仓库
- 首页可加载 `public/data/frameworks.json` 中已经同步到 GitHub 的图形
- 本地上传图形和 GitHub 同步图形支持编辑标题、类型、关键词、引用来源、备注和讲解句式等元数据
- 已同步图形修改后可重新同步到 GitHub，只更新 `public/data/frameworks.json`，不重复上传图片

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

## 编辑图形信息

在图库首页点击图形卡片进入详情弹窗后，本地上传图形和 GitHub 同步图形会显示“编辑信息”按钮。示例图形只作为内置参考模板，不显示编辑按钮。

点击“编辑信息”后，可以修改：

- 标题 `title`
- 研究主题 `category`
- 图形类型 `type`
- 适用场景 `scene`
- 关键词 `tags`
- 简短说明 `description`
- 引用来源 `citation`
- 备注 `notes`
- 讲解句式 `talkScript`

编辑表单使用与上传页面一致的字段样式和选项。点击“保存修改”后，首页卡片、搜索结果、筛选结果和详情弹窗会立即显示新信息；标题、关键词、说明、引用来源、备注和讲解句式也会立即参与搜索。

如果编辑表单里有未保存修改，点击取消、关闭弹窗或按 `Esc` 时会提示确认，避免误关导致内容丢失。删除本地图形仍然需要二次确认。

### 本地修改与 GitHub 重新同步

本地上传但尚未同步到 GitHub 的图形，编辑后只会更新当前浏览器 IndexedDB 中的本地记录，状态仍显示为“本地上传”。需要发布到仓库时，再点击“同步到 GitHub”。

已经同步到 GitHub 的图形，编辑后会先更新本地 IndexedDB 或当前页面状态，并显示“修改未同步”。此时图片文件没有变化，因此不需要重新上传图片；点击“重新同步到 GitHub”后，serverless API 会根据图形 `id` 更新 `public/data/frameworks.json` 中对应记录的元数据，并生成类似下面的提交信息：

```text
Update framework: 图形标题
```

重新同步成功后，状态会恢复为“已同步 GitHub”。如果同步失败，页面会显示“同步失败”和错误信息，本地修改不会因此丢失。

## 同步到 GitHub

项目支持部署到 Vercel 后，把本地上传图形同步到 GitHub 仓库。同步按钮位于本地上传图形的详情弹窗中，点击“同步到 GitHub”后会调用 `/api/github-upload`。

同步成功后，serverless API 会把图片写入：

```text
public/frameworks/uploads/YYYY-MM-DD/random-id.ext
```

并把图形元数据写入或更新：

```text
public/data/frameworks.json
```

元数据包含 `id`、`title`、`category`、`type`、`scene`、`tags`、`description`、`citation`、`notes`、`talkScript`、`imagePath`、`fileType`、`sourceType`、`createdAt`、`updatedAt` 等字段。首页会同时显示示例图形、本地上传图形和已经同步到 GitHub 的图形。

### 为什么不能把 GitHub token 放在前端

前端代码会被打包并发送到用户浏览器。任何写进前端代码、`VITE_` 环境变量或静态资源里的 token，都可能被浏览器开发者工具看到。因此本项目只允许 serverless API 读取 `GITHUB_TOKEN`，前端只请求自己的 `/api/github-upload`，不直接请求 `api.github.com`。

### 创建 GitHub fine-grained token

建议使用 GitHub fine-grained personal access token：

1. 只选择 `case-framework-gallery` 这一个仓库。
2. 在 Repository permissions 中，把 `Contents` 设置为 `Read and write`。
3. 不授予 Issues、Pull requests、Actions、Administration 等不必要权限。
4. 设置合理过期时间，过期后在 Vercel 中更新环境变量。

### Vercel 环境变量

在 Vercel 项目的 Environment Variables 中配置：

```text
GITHUB_TOKEN=<你的 fine-grained token>
GITHUB_OWNER=FangchenKang
GITHUB_REPO=case-framework-gallery
GITHUB_BRANCH=main
```

不要使用 `VITE_GITHUB_TOKEN`，也不要把真实 token 写入 `.env.example`、README 或前端代码。

本仓库提供 `.env.example`，其中只保留变量名和空值。你可以在本地创建 `.env.local`，但该文件已被 `.gitignore` 忽略，不应提交。

仓库中的 `vercel.json` 已固定 Vercel 构建设置：

```text
buildCommand: npm run build
outputDirectory: dist
framework: vite
```

### 本地测试 serverless API

本地测试 API 时，推荐使用 Vercel CLI：

```bash
npm install
npx vercel pull --yes --environment=preview
npx vercel dev
```

第一次运行前，需要先在 Vercel 网页端导入仓库并配置环境变量，再用 `vercel pull` 把项目设置拉到本地。然后打开 Vercel CLI 输出的本地地址。普通 `npm run dev` 只启动 Vite 前端开发服务器，不会运行 `api/github-upload.ts`。

如果只想检查 API TypeScript 是否能通过，可以运行：

```bash
npm run check:api
```

如果想在本地模拟 Vercel 生产构建，可以运行：

```bash
npx vercel build --yes
```

GitHub Pages 只能托管静态前端，因此 `github.io` 地址可以看到“同步到 GitHub”按钮和已经发布的静态图库，但不能真正执行 `/api/github-upload`。真实写入 GitHub 仓库的测试需要在 Vercel 部署地址或 `vercel dev` 环境中完成。

这个 GitHub 同步方案适合个人低频上传和轻量资料库维护；如果后续需要多人高并发协作、权限管理、历史审计或复杂查询，应升级为后端服务或数据库，而不是继续把 GitHub 当数据库使用。

## 技术栈

- React
- Vite
- TypeScript
- 普通 CSS 组件样式
- 本地 SVG/PNG/JPG 静态资源
- Vercel serverless function
- GitHub REST Contents API

## 项目结构

```text
case-framework-gallery/
├─ api/
│  └─ github-upload.ts
├─ index.html
├─ package.json
├─ public/
│  └─ data/
│     └─ frameworks.json
├─ README.md
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ vercel.json
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
   │  ├─ githubFrameworks.ts
   │  ├─ githubSync.ts
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
