interface HeaderProps {
  totalCount: number;
}

export function Header({ totalCount }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">Case Framework Gallery</p>
        <h1>案例框架图库</h1>
        <p className="header__subtitle">
          用于储存、检索和复用案例比赛与学术汇报中的框架图
        </p>
      </div>
      <div className="header__meta" aria-label={`当前收录 ${totalCount} 张框架图`}>
        <span>{totalCount}</span>
        <small>张框架图</small>
      </div>
    </header>
  );
}
