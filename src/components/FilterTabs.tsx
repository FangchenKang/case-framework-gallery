interface FilterTabsProps {
  activeValue: string;
  label: string;
  options: string[];
  onChange: (value: string) => void;
}

export function FilterTabs({ activeValue, label, options, onChange }: FilterTabsProps) {
  return (
    <nav className="filter-tabs" aria-label={label}>
      {options.map((type) => (
        <button
          key={type}
          className={activeValue === type ? 'filter-tabs__item is-active' : 'filter-tabs__item'}
          type="button"
          onClick={() => onChange(type)}
        >
          {type}
        </button>
      ))}
    </nav>
  );
}
