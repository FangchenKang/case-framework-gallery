import type { FrameworkItem } from '../data/frameworks';
import { FrameworkCard } from './FrameworkCard';

interface GalleryGridProps {
  frameworks: FrameworkItem[];
  onOpen: (framework: FrameworkItem) => void;
}

export function GalleryGrid({ frameworks, onOpen }: GalleryGridProps) {
  if (frameworks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <h2>暂无匹配图形</h2>
        <p>可以尝试减少关键词，或切换到其他图形类型。</p>
      </div>
    );
  }

  return (
    <section className="gallery-grid" aria-label="框架图库列表">
      {frameworks.map((framework) => (
        <FrameworkCard key={framework.id} framework={framework} onOpen={onOpen} />
      ))}
    </section>
  );
}
