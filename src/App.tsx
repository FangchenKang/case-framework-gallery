import { useMemo, useState } from 'react';
import { AddFrameworkGuide } from './components/AddFrameworkGuide';
import { FilterTabs } from './components/FilterTabs';
import { FrameworkModal } from './components/FrameworkModal';
import { GalleryGrid } from './components/GalleryGrid';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { frameworks, frameworkTypes, type FrameworkItem, type FrameworkType } from './data/frameworks';

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function App() {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<FrameworkType | '全部'>('全部');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkItem | null>(null);

  const filteredFrameworks = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return frameworks.filter((framework) => {
      const matchesType = activeType === '全部' || framework.type === activeType;

      if (!matchesType) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        framework.title,
        framework.type,
        framework.scene,
        framework.description,
        ...framework.tags,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeType, query]);

  return (
    <main className="app-shell">
      <Header totalCount={frameworks.length} />

      <section className="toolbar" aria-label="图库筛选与搜索">
        <SearchBar value={query} onChange={setQuery} />
        <FilterTabs activeType={activeType} types={frameworkTypes} onChange={setActiveType} />
      </section>

      <div className="gallery-summary" aria-live="polite">
        当前显示 <strong>{filteredFrameworks.length}</strong> / {frameworks.length} 张图形
      </div>

      <GalleryGrid frameworks={filteredFrameworks} onOpen={setSelectedFramework} />
      <AddFrameworkGuide />

      <FrameworkModal framework={selectedFramework} onClose={() => setSelectedFramework(null)} />
    </main>
  );
}

export default App;
