import type { FrameworkType } from '../data/frameworks';

interface FilterTabsProps {
  activeType: FrameworkType | '全部';
  types: FrameworkType[];
  onChange: (type: FrameworkType | '全部') => void;
}

export function FilterTabs({ activeType, types, onChange }: FilterTabsProps) {
  const allTypes: Array<FrameworkType | '全部'> = ['全部', ...types];

  return (
    <nav className="filter-tabs" aria-label="按图形类型筛选">
      {allTypes.map((type) => (
        <button
          key={type}
          className={activeType === type ? 'filter-tabs__item is-active' : 'filter-tabs__item'}
          type="button"
          onClick={() => onChange(type)}
        >
          {type}
        </button>
      ))}
    </nav>
  );
}
