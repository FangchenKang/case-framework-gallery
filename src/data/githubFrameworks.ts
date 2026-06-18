import type {
  FrameworkCategory,
  FrameworkFileType,
  FrameworkType,
  GitHubFrameworkItem,
  GitHubFrameworkRecord,
} from './frameworks';

const GITHUB_DATA_PATH = 'data/frameworks.json';

const frameworkFileTypes: FrameworkFileType[] = ['svg', 'png', 'jpg'];

function normalizePublicPath(path: string) {
  if (/^(https?:|data:|blob:)/.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${path.replace(/^\/+/, '')}`;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isGitHubFrameworkRecord(value: unknown): value is GitHubFrameworkRecord {
  const candidate = value as Partial<GitHubFrameworkRecord>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.category === 'string' &&
    typeof candidate.type === 'string' &&
    typeof candidate.scene === 'string' &&
    typeof candidate.description === 'string' &&
    isStringArray(candidate.tags) &&
    typeof candidate.imagePath === 'string' &&
    typeof candidate.fileType === 'string' &&
    frameworkFileTypes.includes(candidate.fileType as FrameworkFileType) &&
    candidate.sourceType === 'github' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

export function toGitHubFrameworkItem(record: GitHubFrameworkRecord): GitHubFrameworkItem {
  return {
    id: record.id,
    title: record.title,
    category: record.category as FrameworkCategory,
    type: record.type as FrameworkType,
    scene: record.scene,
    description: record.description,
    tags: record.tags,
    citation: record.citation || '',
    notes: record.notes || '',
    talkScript: record.talkScript || '',
    imagePath: normalizePublicPath(record.imagePath),
    fileType: record.fileType,
    source: 'github',
    sourceType: 'github',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    fileName: record.fileName,
    githubSyncedAt: record.updatedAt,
    githubImagePath: record.imagePath,
    githubRecordId: record.id,
    githubSyncStatus: 'synced',
  };
}

export async function getGitHubFrameworks(): Promise<GitHubFrameworkItem[]> {
  const dataUrl = normalizePublicPath(GITHUB_DATA_PATH);
  const response = await fetch(dataUrl, { cache: 'no-store' });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`GitHub 同步图库读取失败：${response.status}`);
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.filter(isGitHubFrameworkRecord).map(toGitHubFrameworkItem);
}
