import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  frameworkCategories,
  frameworkTypes,
  type FrameworkCategory,
  type FrameworkFileType,
  type FrameworkType,
} from '../data/frameworks';
import { createLocalFrameworkId, type LocalFrameworkItem } from '../data/localFrameworks';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg'];

interface UploadPageProps {
  localFrameworks: LocalFrameworkItem[];
  onSave: (framework: LocalFrameworkItem) => Promise<void>;
  onImport: (frameworks: LocalFrameworkItem[]) => Promise<void>;
  onNavigateGallery: () => void;
}

interface FormState {
  title: string;
  category: FrameworkCategory;
  type: FrameworkType;
  scene: string;
  tags: string;
  description: string;
  citation: string;
  notes: string;
  talkScript: string;
}

interface UploadedFileState {
  dataUrl: string;
  fileName: string;
  fileType: FrameworkFileType;
  svgSource?: string;
}

const initialFormState: FormState = {
  title: '',
  category: '其他',
  type: '机制图',
  scene: '',
  tags: '',
  description: '',
  citation: '',
  notes: '',
  talkScript: '',
};

function getFileExtension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

function getFrameworkFileType(file: File): FrameworkFileType | null {
  const extension = getFileExtension(file);

  if (extension === 'svg') {
    return 'svg';
  }

  if (extension === 'png') {
    return 'png';
  }

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'jpg';
  }

  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function parseTags(tags: string) {
  return tags
    .split(/[,，、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function downloadJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function isLocalFrameworkArray(value: unknown): value is LocalFrameworkItem[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      const candidate = item as Partial<LocalFrameworkItem>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.imagePath === 'string' &&
        candidate.source === 'local'
      );
    })
  );
}

export function UploadPage({
  localFrameworks,
  onSave,
  onImport,
  onNavigateGallery,
}: UploadPageProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFile = async (file?: File) => {
    setMessage('');

    if (!file) {
      return;
    }

    const extension = getFileExtension(file);
    const fileType = getFrameworkFileType(file);

    if (!ACCEPTED_EXTENSIONS.includes(extension) || !fileType) {
      setMessage('文件类型不符合要求，请上传 PNG、JPG、JPEG 或 SVG。');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage('文件过大，请控制在 10MB 以内。');
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    const svgSource = fileType === 'svg' ? await file.text() : undefined;

    setUploadedFile({
      dataUrl,
      fileName: file.name,
      fileType,
      svgSource,
    });

    if (!form.title) {
      updateField('title', file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleSave = async () => {
    setMessage('');

    if (!uploadedFile) {
      setMessage('请先上传一张框架图图片。');
      return;
    }

    if (!form.title.trim() || !form.scene.trim() || !form.description.trim()) {
      setMessage('请至少填写标题、适用场景和简短说明。');
      return;
    }

    const item: LocalFrameworkItem = {
      id: createLocalFrameworkId(),
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      scene: form.scene.trim(),
      description: form.description.trim(),
      tags: parseTags(form.tags),
      citation: form.citation.trim(),
      notes: form.notes.trim(),
      talkScript: form.talkScript.trim(),
      imagePath: uploadedFile.dataUrl,
      fileType: uploadedFile.fileType,
      svgSource: uploadedFile.svgSource,
      source: 'local',
      createdAt: new Date().toISOString(),
      fileName: uploadedFile.fileName,
    };

    await onSave(item);
    setMessage('已保存到本地图库。');
    setForm(initialFormState);
    setUploadedFile(null);
    onNavigateGallery();
  };

  const handleImport = async (file?: File) => {
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      if (!isLocalFrameworkArray(parsed)) {
        setMessage('导入失败：JSON 格式不是有效的本地图库数据。');
        return;
      }

      await onImport(parsed);
      setMessage(`已导入 ${parsed.length} 条本地图形数据。`);
    } catch {
      setMessage('导入失败：无法读取或解析 JSON 文件。');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  return (
    <section className="upload-page" aria-labelledby="upload-title">
      <div className="section-heading">
        <p className="section-eyebrow">Local Upload</p>
        <h2 id="upload-title">上传图形</h2>
        <p>把已有框架图保存到浏览器本地图库，并补充轻量标注信息。</p>
      </div>

      <div className="upload-layout">
        <section className="form-panel" aria-labelledby="file-section-title">
          <h3 id="file-section-title">图形文件</h3>
          <button
            className={isDragging ? 'drop-zone is-dragging' : 'drop-zone'}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
          >
            <Upload aria-hidden="true" size={28} strokeWidth={1.7} />
            <span>点击或拖拽上传 PNG、JPG、JPEG、SVG</span>
            <small>建议单个文件不超过 10MB</small>
          </button>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          {uploadedFile ? (
            <div className="upload-preview">
              <img src={uploadedFile.dataUrl} alt="上传图形预览" />
              <p>
                {uploadedFile.fileName} · {uploadedFile.fileType.toUpperCase()}
              </p>
            </div>
          ) : null}
        </section>

        <section className="form-panel form-panel--wide" aria-labelledby="basic-section-title">
          <h3 id="basic-section-title">基本信息</h3>
          <div className="form-grid">
            <label>
              标题 title
              <input
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="例如：社区韧性治理机制图"
              />
            </label>
            <label>
              研究主题 category
              <select
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
              >
                {frameworkCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              图形类型 type
              <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
                {frameworkTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              适用场景 scene
              <input
                value={form.scene}
                onChange={(event) => updateField('scene', event.target.value)}
                placeholder="例如：案例比赛机制分析页、理论汇报页"
              />
            </label>
            <label className="form-grid__full">
              关键词 tags
              <input
                value={form.tags}
                onChange={(event) => updateField('tags', event.target.value)}
                placeholder="用逗号分隔，例如：基层治理，价值共创，风险治理"
              />
            </label>
            <label className="form-grid__full">
              简短说明 description
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="用一句或两句话说明这个图适合解释什么问题。"
              />
            </label>
          </div>
        </section>

        <section className="form-panel form-panel--wide" aria-labelledby="source-section-title">
          <h3 id="source-section-title">来源与备注</h3>
          <div className="form-grid">
            <label className="form-grid__full">
              引用来源 citation
              <textarea
                rows={5}
                value={form.citation}
                onChange={(event) => updateField('citation', event.target.value)}
                placeholder="可直接粘贴国标、APA、Chicago、论文标题、网址、书籍或会议论文信息；不知道来源可留空。"
              />
            </label>
            <label className="form-grid__full">
              备注 notes
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="记录改图思路、适用限制或后续需要调整的地方。"
              />
            </label>
          </div>
        </section>

        <section className="form-panel form-panel--wide" aria-labelledby="script-section-title">
          <h3 id="script-section-title">使用说明</h3>
          <label>
            讲解句式 talkScript
            <textarea
              rows={4}
              value={form.talkScript}
              onChange={(event) => updateField('talkScript', event.target.value)}
              placeholder="例如：这张图主要用于说明……其核心逻辑是……"
            />
          </label>
          <div className="form-actions">
            <button className="button button--primary" type="button" onClick={() => void handleSave()}>
              保存到图库
            </button>
            <button className="button button--secondary" type="button" onClick={onNavigateGallery}>
              返回图库首页
            </button>
          </div>
          {message ? <p className="form-message">{message}</p> : null}
        </section>

        <section className="form-panel form-panel--wide" aria-labelledby="backup-section-title">
          <h3 id="backup-section-title">本地数据备份</h3>
          <p className="panel-note">
            当前浏览器已保存 {localFrameworks.length} 张本地图形。重要图库请定期导出 JSON 备份。
          </p>
          <div className="form-actions">
            <button
              className="button button--secondary"
              type="button"
              onClick={() => downloadJson('case-framework-gallery-local-data.json', localFrameworks)}
            >
              导出图库数据 JSON
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => importInputRef.current?.click()}
            >
              导入图库数据 JSON
            </button>
          </div>
          <input
            ref={importInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </section>
      </div>
    </section>
  );
}

