export type AppPage = 'gallery' | 'upload' | 'guide';

interface TopNavigationProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navItems: Array<{ page: AppPage; label: string }> = [
  { page: 'gallery', label: '图库首页' },
  { page: 'upload', label: '上传图形' },
  { page: 'guide', label: '使用说明' },
];

export function TopNavigation({ currentPage, onNavigate }: TopNavigationProps) {
  return (
    <nav className="top-nav" aria-label="主要页面导航">
      <div className="top-nav__brand">Case Framework Gallery</div>
      <div className="top-nav__links">
        {navItems.map((item) => (
          <button
            key={item.page}
            className={currentPage === item.page ? 'top-nav__item is-active' : 'top-nav__item'}
            type="button"
            onClick={() => onNavigate(item.page)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

