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
  type GitHubFrameworkItem,
  type FrameworkCategory,
  type FrameworkItem,
  type FrameworkMetadataFields,
  type FrameworkType,
} from './data/frameworks';
import { getGitHubFrameworks } from './data/githubFrameworks';
import { syncFrameworkToGitHub, updateFrameworkMetadataOnGitHub } from './data/githubSync';
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

function mergeFrameworkSources(frameworkGroups: FrameworkItem[][]) {
  const frameworksById = new Map<string, FrameworkItem>();

  frameworkGroups.flat().forEach((framework) => {
    frameworksById.set(framework.id, framework);
  });

  return Array.from(frameworksById.values());
}

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('gallery');
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<FrameworkType | '全部'>('全部');
  const [activeCategory, setActiveCategory] = useState<FrameworkCategory | '全部主题'>('全部主题');
  const [selectedFramework, setSelectedFramework] = useState<FrameworkItem | null>(null);
  const [localFrameworks, setLocalFrameworks] = useState<LocalFrameworkItem[]>([]);
  const [githubFrameworks, setGithubFrameworks] = useState<GitHubFrameworkItem[]>([]);
  const [storageMessage, setStorageMessage] = useState('');

  useEffect(() => {
    getLocalFrameworks()
      .then(setLocalFrameworks)
      .catch(() => setStorageMessage('本地图库读取失败，请检查浏览器 IndexedDB 权限。'));
  }, []);

  useEffect(() => {
    getGitHubFrameworks()
      .then(setGithubFrameworks)
      .catch(() => setStorageMessage('GitHub 同步图库读取失败，请稍后刷新重试。'));
  }, []);

  const allFrameworks = useMemo(
    () => mergeFrameworkSources([frameworks, githubFrameworks, localFrameworks]),
    [githubFrameworks, localFrameworks],
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

  const handleSyncToGitHub = async (framework: FrameworkItem) => {
    if (framework.source !== 'local') {
      throw new Error('只有本地上传图形可以同步到 GitHub。');
    }

    const githubFramework = await syncFrameworkToGitHub(framework as LocalFrameworkItem);
    const syncedLocalFramework: LocalFrameworkItem = {
      ...(framework as LocalFrameworkItem),
      githubSyncedAt: githubFramework.updatedAt,
      githubImagePath: githubFramework.imagePath,
      githubRecordId: githubFramework.id,
      githubSyncStatus: 'synced',
      githubSyncError: undefined,
    };

    await saveLocalFramework(syncedLocalFramework);
    setLocalFrameworks((current) =>
      current.map((item) => (item.id === syncedLocalFramework.id ? syncedLocalFramework : item)),
    );
    setGithubFrameworks((current) => {
      const next = current.filter((item) => item.id !== githubFramework.id);
      return [...next, githubFramework];
    });
    setSelectedFramework(syncedLocalFramework);

    return githubFramework;
  };

  const handleSaveFrameworkMetadata = async (
    framework: FrameworkItem,
    metadata: FrameworkMetadataFields,
  ) => {
    if (framework.source === 'sample') {
      throw new Error('示例图形不能编辑。');
    }

    const isSynced = framework.source === 'github' || Boolean(framework.githubSyncedAt);
    const updatedAt = new Date().toISOString();
    const updatedFramework: FrameworkItem = {
      ...framework,
      ...metadata,
      updatedAt,
      githubSyncStatus: isSynced ? 'dirty' : framework.githubSyncStatus,
      githubSyncError: undefined,
    };

    if (framework.source === 'local') {
      const updatedLocalFramework = updatedFramework as LocalFrameworkItem;
      await saveLocalFramework(updatedLocalFramework);
      setLocalFrameworks((current) =>
        current.map((item) =>
          item.id === updatedLocalFramework.id ? updatedLocalFramework : item,
        ),
      );
      setSelectedFramework(updatedLocalFramework);
      return updatedLocalFramework;
    }

    const updatedGitHubFramework = {
      ...updatedFramework,
      source: 'github',
      sourceType: 'github',
      createdAt: framework.createdAt || updatedAt,
    } as GitHubFrameworkItem;

    setGithubFrameworks((current) =>
      current.map((item) =>
        item.id === updatedGitHubFramework.id ? updatedGitHubFramework : item,
      ),
    );
    setSelectedFramework(updatedGitHubFramework);
    return updatedGitHubFramework;
  };

  const markGitHubSyncFailure = (framework: FrameworkItem, message: string) => {
    const failedFramework: FrameworkItem = {
      ...framework,
      githubSyncStatus: 'failed',
      githubSyncError: message,
    };

    if (framework.source === 'local') {
      const failedLocalFramework = failedFramework as LocalFrameworkItem;
      setLocalFrameworks((current) =>
        current.map((item) =>
          item.id === failedLocalFramework.id ? failedLocalFramework : item,
        ),
      );
      setSelectedFramework(failedLocalFramework);
      void saveLocalFramework(failedLocalFramework);
      return;
    }

    if (framework.source === 'github') {
      const failedGitHubFramework = failedFramework as GitHubFrameworkItem;
      setGithubFrameworks((current) =>
        current.map((item) =>
          item.id === failedGitHubFramework.id ? failedGitHubFramework : item,
        ),
      );
      setSelectedFramework(failedGitHubFramework);
    }
  };

  const handleResyncGitHubMetadata = async (framework: FrameworkItem) => {
    if (framework.source === 'sample') {
      throw new Error('示例图形不能同步到 GitHub。');
    }

    try {
      const githubFramework = await updateFrameworkMetadataOnGitHub(framework);

      if (framework.source === 'local') {
        const syncedLocalFramework: LocalFrameworkItem = {
          ...(framework as LocalFrameworkItem),
          githubSyncedAt: githubFramework.updatedAt,
          githubImagePath: githubFramework.githubImagePath || githubFramework.imagePath,
          githubRecordId: githubFramework.id,
          githubSyncStatus: 'synced',
          githubSyncError: undefined,
        };

        await saveLocalFramework(syncedLocalFramework);
        setLocalFrameworks((current) =>
          current.map((item) =>
            item.id === syncedLocalFramework.id ? syncedLocalFramework : item,
          ),
        );
        setSelectedFramework(syncedLocalFramework);
      } else {
        const syncedGitHubFramework: GitHubFrameworkItem = {
          ...githubFramework,
          githubSyncStatus: 'synced',
          githubSyncError: undefined,
        };

        setGithubFrameworks((current) =>
          current.map((item) =>
            item.id === syncedGitHubFramework.id ? syncedGitHubFramework : item,
          ),
        );
        setSelectedFramework(syncedGitHubFramework);
      }

      setGithubFrameworks((current) => {
        const next = current.filter((item) => item.id !== githubFramework.id);
        return [...next, githubFramework];
      });

      return githubFramework;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub 重新同步失败。';
      markGitHubSyncFailure(framework, message);
      throw error;
    }
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
            {githubFrameworks.length > 0 ? `，GitHub 同步 ${githubFrameworks.length} 张` : ''}
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
        onSyncToGitHub={handleSyncToGitHub}
        onSaveMetadata={handleSaveFrameworkMetadata}
        onResyncGitHubMetadata={handleResyncGitHubMetadata}
      />
    </main>
  );
}

export default App;
