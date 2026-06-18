import { useEffect, useMemo, useState } from 'react';
import { AddFrameworkGuide } from './components/AddFrameworkGuide';
import { FilterTabs } from './components/FilterTabs';
import { FrameworkModal } from './components/FrameworkModal';
import { GalleryGrid } from './components/GalleryGrid';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { TopNavigation, type AppPage } from './components/TopNavigation';
import { UploadPage } from './components/UploadPage';
import { UsageGuidePage } from './components/UsageGuidePage';
import {
  frameworkCategories,
  frameworks,
  frameworkTypes,
  type FrameworkCategory,
  type FrameworkItem,
  type FrameworkType,
} from './data/frameworks';
import {
  deleteLocalFramework,
  getLocalFrameworks,
  importLocalFrameworks,
  saveLocalFramework,
  type LocalFrameworkItem,
} from './data/localFrameworks';

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('gallery');
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<FrameworkType | '全部'>('全部');
  const [activeCategory, setActiveCategory] = useState<FrameworkCategory | '全部主题'>('全部主题');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkItem | null>(null);
  const [localFrameworks, setLocalFrameworks] = useState<LocalFrameworkItem[]>([]);
  const [storageMessage, setStorageMessage] = useState('');

  useEffect(() => {
    getLocalFrameworks()
      .then(setLocalFrameworks)
      .catch(() => setStorageMessage('本地图库读取失败，请检查浏览器 IndexedDB 权限。'));
  }, []);

  const allFrameworks = useMemo(
    () => [...frameworks, ...localFrameworks],
    [localFrameworks],
  );

  const filteredFrameworks = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return allFrameworks.filter((framework) => {
      const matchesType = activeType === '全部' || framework.type === activeType;
      const matchesCategory =
        activeCategory === '全部主题' || framework.category === activeCategory;

      if (!matchesType || !matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        framework.title,
        framework.type,
        framework.category,
        framework.scene,
        framework.description,
        framework.citation || '',
        framework.notes || '',
        framework.talkScript || '',
        ...framework.tags,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [activeCategory, activeType, allFrameworks, query]);

  const handleSaveLocalFramework = async (framework: LocalFrameworkItem) => {
    await saveLocalFramework(framework);
    setLocalFrameworks((current) => [...current, framework]);
  };

  const handleImportLocalFrameworks = async (items: LocalFrameworkItem[]) => {
    const savedItems = await importLocalFrameworks(items);
    setLocalFrameworks(await getLocalFrameworks());
    setStorageMessage(`已导入 ${savedItems.length} 条本地图形。`);
  };

  const handleDeleteLocalFramework = async (id: string) => {
    await deleteLocalFramework(id);
    setLocalFrameworks((current) => current.filter((framework) => framework.id !== id));
    setSelectedFramework(null);
  };

  return (
    <main className="app-shell">
      <TopNavigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <Header totalCount={allFrameworks.length} />

      {currentPage === 'gallery' ? (
        <>
          <section className="toolbar" aria-label="图库筛选与搜索">
            <SearchBar value={query} onChange={setQuery} />
            <div className="filter-group" aria-label="筛选条件">
              <FilterTabs
                activeValue={activeCategory}
                label="按研究主题筛选"
                options={['全部主题', ...frameworkCategories]}
                onChange={(value) => setActiveCategory(value as FrameworkCategory | '全部主题')}
              />
              <FilterTabs
                activeValue={activeType}
                label="按图形类型筛选"
                options={['全部', ...frameworkTypes]}
                onChange={(value) => setActiveType(value as FrameworkType | '全部')}
              />
            </div>
          </section>

          <div className="gallery-summary" aria-live="polite">
            当前显示 <strong>{filteredFrameworks.length}</strong> / {allFrameworks.length} 张图形
            {localFrameworks.length > 0 ? `，其中本地上传 ${localFrameworks.length} 张` : ''}
          </div>

          {storageMessage ? <p className="storage-message">{storageMessage}</p> : null}
          <GalleryGrid frameworks={filteredFrameworks} onOpen={setSelectedFramework} />
          <AddFrameworkGuide />
        </>
      ) : null}

      {currentPage === 'upload' ? (
        <UploadPage
          localFrameworks={localFrameworks}
          onSave={handleSaveLocalFramework}
          onImport={handleImportLocalFrameworks}
          onNavigateGallery={() => setCurrentPage('gallery')}
        />
      ) : null}

      {currentPage === 'guide' ? <UsageGuidePage /> : null}

      <FrameworkModal
        framework={selectedFramework}
        onClose={() => setSelectedFramework(null)}
        onDeleteLocal={handleDeleteLocalFramework}
      />
    </main>
  );
}

export default App;
