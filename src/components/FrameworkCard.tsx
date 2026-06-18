import type { FrameworkItem } from '../data/frameworks';

interface FrameworkCardProps {
  framework: FrameworkItem;
  onOpen: (framework: FrameworkItem) => void;
}

export function FrameworkCard({ framework, onOpen }: FrameworkCardProps) {
  return (
    <article className="framework-card">
      <button
        className="framework-card__button"
        type="button"
        onClick={() => onOpen(framework)}
        aria-label={`打开 ${framework.title} 详情`}
      >
        <div className="framework-card__preview">
          <img src={framework.imagePath} alt={framework.title} loading="lazy" />
        </div>
        <div className="framework-card__body">
          <div className="framework-card__topline">
            <span className="framework-card__type">{framework.type}</span>
            <span className="framework-card__format">{framework.fileType.toUpperCase()}</span>
          </div>
          <h2>{framework.title}</h2>
          <p className="framework-card__scene">{framework.scene}</p>
          <p className="framework-card__description">{framework.description}</p>
          <ul className="tag-list" aria-label={`${framework.title} 的关键词`}>
            {framework.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </button>
    </article>
  );
}
