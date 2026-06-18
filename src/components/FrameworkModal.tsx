import { Clipboard, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FrameworkItem } from '../data/frameworks';

interface FrameworkModalProps {
  framework: FrameworkItem | null;
  onClose: () => void;
  onDeleteLocal: (id: string) => Promise<void>;
  onSyncToGitHub: (framework: FrameworkItem) => Promise<FrameworkItem>;
}

function getSourceLabel(source: FrameworkItem['source']) {
  if (source === 'local') {
    return '本地上传';
  }

  if (source === 'github') {
    return 'GitHub 同步';
  }

  return '示例图形';
}

export function FrameworkModal({
  framework,
  onClose,
  onDeleteLocal,
  onSyncToGitHub,
}: FrameworkModalProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!framework) {
      return;
    }

    setCopyStatus('');
    setSyncStatus(
      framework.source === 'local' && framework.githubSyncedAt ? '已同步到 GitHub' : '',
    );
    setIsSyncing(false);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [framework, onClose]);

  if (!framework) {
    return null;
  }

  const fileName = `${framework.id}.${framework.fileType}`;

  const copySvgSource = async () => {
    if (!framework.svgSource) {
      return;
    }

    try {
      await navigator.clipboard.writeText(framework.svgSource);
      setCopyStatus('已复制 SVG 源代码');
    } catch {
      setCopyStatus('复制失败，请在浏览器中允许剪贴板权限');
    }
  };

  const copyCitation = async () => {
    if (!framework.citation) {
      return;
    }

    try {
      await navigator.clipboard.writeText(framework.citation);
      setCopyStatus('已复制引用来源');
    } catch {
      setCopyStatus('复制失败，请在浏览器中允许剪贴板权限');
    }
  };

  const deleteLocalFramework = async () => {
    if (framework.source !== 'local') {
      return;
    }

    const confirmed = window.confirm(`确认删除“${framework.title}”？此操作只会删除本地图库数据。`);

    if (confirmed) {
      await onDeleteLocal(framework.id);
    }
  };

  const syncToGitHub = async () => {
    if (framework.source !== 'local') {
      return;
    }

    setIsSyncing(true);
    setSyncStatus('同步中...');

    try {
      await onSyncToGitHub(framework);
      setSyncStatus('已同步到 GitHub');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub 同步失败。';
      setSyncStatus(`同步失败：${message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="framework-modal-title">
      <button className="modal__overlay" type="button" onClick={onClose} aria-label="关闭详情" />
      <div className="modal__panel">
        <div className="modal__preview">
          <img src={framework.imagePath} alt={framework.title} />
        </div>

        <aside className="modal__side" aria-label={`${framework.title} 的图形信息`}>
          <div className="modal__header">
            <div>
              <span className="modal__type">{framework.type}</span>
              <span className="modal__source">{getSourceLabel(framework.source)}</span>
              <h2 id="framework-modal-title">{framework.title}</h2>
            </div>
            <button className="icon-button" type="button" onClick={onClose} title="关闭">
              <X aria-hidden="true" size={20} />
              <span className="sr-only">关闭</span>
            </button>
          </div>

          <div className="modal__content">
            <div>
              <h3>研究主题</h3>
              <p>{framework.category}</p>
            </div>
            <div>
              <h3>说明</h3>
              <p>{framework.description}</p>
            </div>
            <div>
              <h3>适用场景</h3>
              <p>{framework.scene}</p>
            </div>
            <div>
              <h3>关键词</h3>
              <ul className="tag-list tag-list--modal">
                {framework.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
            {framework.citation ? (
              <div>
                <div className="modal__section-title">
                  <h3>引用来源</h3>
                  <button className="text-button" type="button" onClick={copyCitation}>
                    复制引用
                  </button>
                </div>
                <p className="pre-line">{framework.citation}</p>
              </div>
            ) : null}
            {framework.notes ? (
              <div>
                <h3>备注</h3>
                <p className="pre-line">{framework.notes}</p>
              </div>
            ) : null}
            {framework.talkScript ? (
              <div>
                <h3>讲解句式</h3>
                <p className="pre-line">{framework.talkScript}</p>
              </div>
            ) : null}
            <dl className="modal__facts">
              <div>
                <dt>文件格式</dt>
                <dd>{framework.fileType.toUpperCase()}</dd>
              </div>
              <div>
                <dt>文件名</dt>
                <dd>{fileName}</dd>
              </div>
            </dl>
          </div>

          <div className="modal__actions">
            <a className="button button--primary" href={framework.imagePath} download={fileName}>
              <Download aria-hidden="true" size={17} />
              下载图片
            </a>
            {framework.fileType === 'svg' && framework.svgSource ? (
              <button className="button button--secondary" type="button" onClick={copySvgSource}>
                <Clipboard aria-hidden="true" size={17} />
                复制 SVG 源代码
              </button>
            ) : null}
            {framework.source === 'local' ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void syncToGitHub()}
                disabled={isSyncing}
              >
                {isSyncing ? '同步中...' : '同步到 GitHub'}
              </button>
            ) : null}
            {framework.source === 'local' ? (
              <button className="button button--danger" type="button" onClick={deleteLocalFramework}>
                删除此图形
              </button>
            ) : null}
            {copyStatus ? <span className="modal__status">{copyStatus}</span> : null}
            {syncStatus ? <span className="modal__status">{syncStatus}</span> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
