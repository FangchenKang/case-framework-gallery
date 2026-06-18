import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span className="sr-only">搜索关键词</span>
      <Search aria-hidden="true" size={18} strokeWidth={1.8} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索关键词，如：基层治理、政策执行、价值共创…"
      />
    </label>
  );
}
