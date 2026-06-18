import { useEffect, useMemo, useState } from 'react';
import {
  frameworkCategories,
  frameworkTypes,
  type FrameworkItem,
  type FrameworkMetadataFields,
} from '../data/frameworks';

interface FrameworkEditFormProps {
  framework: FrameworkItem;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onSave: (metadata: FrameworkMetadataFields) => Promise<void>;
}

interface FormState {
  title: string;
  category: string;
  type: string;
  scene: string;
  tags: string;
  description: string;
  citation: string;
  notes: string;
  talkScript: string;
}

function toFormState(framework: FrameworkItem): FormState {
  return {
    title: framework.title,
    category: framework.category,
    type: framework.type,
    scene: framework.scene,
    tags: framework.tags.join('，'),
    description: framework.description,
    citation: framework.citation || '',
    notes: framework.notes || '',
    talkScript: framework.talkScript || '',
  };
}

function parseTags(tags: string) {
  return tags
    .split(/[,，、\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function serializeForm(form: FormState) {
  return JSON.stringify({
    ...form,
    tags: parseTags(form.tags),
  });
}

export function FrameworkEditForm({
  framework,
  onCancel,
  onDirtyChange,
  onSave,
}: FrameworkEditFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(framework));
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const initialSnapshot = useMemo(() => serializeForm(toFormState(framework)), [framework]);
  const isDirty = serializeForm(form) !== initialSnapshot;

  useEffect(() => {
    setForm(toFormState(framework));
    setMessage('');
    setIsSaving(false);
  }, [framework]);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const cancelEdit = () => {
    if (isDirty && !window.confirm('当前有未保存修改，确认放弃吗？')) {
      return;
    }

    onCancel();
  };

  const saveEdit = async () => {
    setMessage('');

    if (!form.title.trim() || !form.scene.trim() || !form.description.trim()) {
      setMessage('请至少填写标题、适用场景和简短说明。');
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        title: form.title.trim(),
        category: form.category as FrameworkMetadataFields['category'],
        type: form.type as FrameworkMetadataFields['type'],
        scene: form.scene.trim(),
        tags: parseTags(form.tags),
        description: form.description.trim(),
        citation: form.citation.trim(),
        notes: form.notes.trim(),
        talkScript: form.talkScript.trim(),
      });
      onDirtyChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '保存修改失败。';
      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="edit-form" onSubmit={(event) => event.preventDefault()}>
      <div className="modal__section-title">
        <h3>编辑图形信息</h3>
        <span className="modal__status">{isDirty ? '有未保存修改' : '当前信息已保存'}</span>
      </div>

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
        <label className="form-grid__full">
          引用来源 citation
          <textarea
            rows={4}
            value={form.citation}
            onChange={(event) => updateField('citation', event.target.value)}
            placeholder="可直接粘贴完整参考文献或来源信息；不知道来源可留空。"
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
        <label className="form-grid__full">
          讲解句式 talkScript
          <textarea
            rows={4}
            value={form.talkScript}
            onChange={(event) => updateField('talkScript', event.target.value)}
            placeholder="例如：这张图主要用于说明……其核心逻辑是……"
          />
        </label>
      </div>

      <div className="form-actions">
        <button
          className="button button--primary"
          type="button"
          onClick={() => void saveEdit()}
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存修改'}
        </button>
        <button className="button button--secondary" type="button" onClick={cancelEdit}>
          取消
        </button>
      </div>
      {message ? <p className="form-message">{message}</p> : null}
    </form>
  );
}
