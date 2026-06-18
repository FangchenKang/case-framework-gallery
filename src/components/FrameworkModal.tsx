import { Clipboard, Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FrameworkItem } from '../data/frameworks';

interface FrameworkModalProps {
  framework: FrameworkItem | null;
  onClose: () => void;
}

export function FrameworkModal({ framework, onClose }: FrameworkModalProps) {
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    if (!framework) {
      return;
    }

    setCopyStatus('');

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
              <h2 id="framework-modal-title">{framework.title}</h2>
            </div>
            <button className="icon-button" type="button" onClick={onClose} title="关闭">
              <X aria-hidden="true" size={20} />
              <span className="sr-only">关闭</span>
            </button>
          </div>

          <div className="modal__content">
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
            {copyStatus ? <span className="modal__status">{copyStatus}</span> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
