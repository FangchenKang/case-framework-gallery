import { Clipboard, Download, Pencil, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FrameworkItem, FrameworkMetadataFields } from '../data/frameworks';
import { FrameworkEditForm } from './FrameworkEditForm';

interface FrameworkModalProps {
  framework: FrameworkItem | null;
  onClose: () => void;
  onDeleteLocal: (id: string) => Promise<void>;
  onSyncToGitHub: (framework: FrameworkItem) => Promise<FrameworkItem>;
  onSaveMetadata: (
    framework: FrameworkItem,
    metadata: FrameworkMetadataFields,
  ) => Promise<FrameworkItem>;
  onResyncGitHubMetadata: (framework: FrameworkItem) => Promise<FrameworkItem>;
}

function getSourceLabel(framework: FrameworkItem) {
  if (framework.githubSyncStatus === 'failed') {
    return '同步失败';
  }

  if (framework.githubSyncStatus === 'dirty') {
    return '修改未同步';
  }

  if (framework.source === 'local' && framework.githubSyncedAt) {
    return '已同步 GitHub';
  }

  if (framework.source === 'local') {
    return '本地上传';
  }

  if (framework.source === 'github') {
    return '已同步 GitHub';
  }

  return '示例图形';
}

export function FrameworkModal({
  framework,
  onClose,
  onDeleteLocal,
  onSyncToGitHub,
  onSaveMetadata,
  onResyncGitHubMetadata,
}: FrameworkModalProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedEdit, setHasUnsavedEdit] = useState(false);

  const requestClose = useCallback(() => {
    if (hasUnsavedEdit && !window.confirm('当前有未保存修改，确认关闭吗？')) {
      return;
    }

    onClose();
  }, [hasUnsavedEdit, onClose]);

  useEffect(() => {
    if (!framework) {
      return;
    }

    setCopyStatus('');
    setSyncStatus(
      framework.source === 'local' && framework.githubSyncedAt ? '已同步到 GitHub' : '',
    );
    setIsSyncing(false);
    setIsEditing(false);
    setHasUnsavedEdit(false);
  }, [framework]);

  useEffect(() => {
    if (!framework) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [framework, requestClose]);

  if (!framework) {
    return null;
  }

  const fileName = `${framework.id}.${framework.fileType}`;
  const canEdit = framework.source !== 'sample';
  const canUploadToGitHub = framework.source === 'local' && !framework.githubSyncedAt;
  const canResyncToGitHub = framework.source === 'github' || Boolean(framework.githubSyncedAt);

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

  const saveMetadata = async (metadata: FrameworkMetadataFields) => {
    const updatedFramework = await onSaveMetadata(framework, metadata);
    setIsEditing(false);
    setHasUnsavedEdit(false);
    setSyncStatus(
      updatedFramework.githubSyncStatus === 'dirty'
        ? '修改已保存，需要重新同步到 GitHub'
        : '修改已保存到本地',
    );
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

  const resyncToGitHub = async () => {
    if (framework.source === 'sample') {
      return;
    }

    setIsSyncing(true);
    setSyncStatus('重新同步中...');

    try {
      await onResyncGitHubMetadata(framework);
      setSyncStatus('已同步到 GitHub');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub 重新同步失败。';
      setSyncStatus(`同步失败：${message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="framework-modal-title">
      <button className="modal__overlay" type="button" onClick={requestClose} aria-label="关闭详情" />
      <div className="modal__panel">
        <div className="modal__preview">
          <img src={framework.imagePath} alt={framework.title} />
        </div>

        <aside className="modal__side" aria-label={`${framework.title} 的图形信息`}>
          <div className="modal__header">
            <div>
              <span className="modal__type">{framework.type}</span>
              <span className="modal__source">{getSourceLabel(framework)}</span>
              <h2 id="framework-modal-title">{framework.title}</h2>
            </div>
            <button className="icon-button" type="button" onClick={requestClose} title="关闭">
              <X aria-hidden="true" size={20} />
              <span className="sr-only">关闭</span>
            </button>
          </div>

          {isEditing ? (
            <div className="modal__content">
              <FrameworkEditForm
                framework={framework}
                onCancel={() => setIsEditing(false)}
                onDirtyChange={setHasUnsavedEdit}
                onSave={saveMetadata}
              />
            </div>
          ) : (
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
              {framework.githubSyncError ? (
                <div>
                  <h3>同步错误</h3>
                  <p>{framework.githubSyncError}</p>
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
          )}

          <div className="modal__actions">
            {canEdit && !isEditing ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                <Pencil aria-hidden="true" size={17} />
                编辑信息
              </button>
            ) : null}
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
            {canUploadToGitHub ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void syncToGitHub()}
                disabled={isSyncing}
              >
                {isSyncing ? '同步中...' : '同步到 GitHub'}
              </button>
            ) : null}
            {canResyncToGitHub ? (
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void resyncToGitHub()}
                disabled={isSyncing}
              >
                <RefreshCw aria-hidden="true" size={17} />
                {isSyncing ? '重新同步中...' : '重新同步到 GitHub'}
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
