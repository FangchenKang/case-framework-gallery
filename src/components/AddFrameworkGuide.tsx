import { FilePlus2 } from 'lucide-react';

export function AddFrameworkGuide() {
  return (
    <section className="guide" aria-labelledby="guide-title">
      <div className="guide__title">
        <FilePlus2 aria-hidden="true" size={22} strokeWidth={1.7} />
        <h2 id="guide-title">新增图形说明</h2>
      </div>
      <ol>
        <li>把 SVG、PNG 或 JPG 文件放入 src/assets/frameworks。</li>
        <li>在 src/data/frameworks.ts 中新增一条图形信息。</li>
        <li>重新运行网页，或在开发服务器中刷新页面查看效果。</li>
      </ol>
    </section>
  );
}
