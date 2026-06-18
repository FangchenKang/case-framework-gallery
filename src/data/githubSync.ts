import type { FrameworkItem, GitHubFrameworkItem, GitHubFrameworkRecord } from './frameworks';
import { toGitHubFrameworkItem } from './githubFrameworks';
import type { LocalFrameworkItem } from './localFrameworks';

interface GitHubUploadResponse {
  framework?: GitHubFrameworkRecord;
  error?: string;
}

function toFrameworkPayload(framework: FrameworkItem) {
  return {
    id: framework.githubRecordId || framework.id,
    title: framework.title,
    category: framework.category,
    type: framework.type,
    scene: framework.scene,
    tags: framework.tags,
    description: framework.description,
    citation: framework.citation || '',
    notes: framework.notes || '',
    talkScript: framework.talkScript || '',
    imagePath: framework.githubImagePath || framework.imagePath,
    fileType: framework.fileType,
    createdAt: framework.createdAt || new Date().toISOString(),
    fileName: framework.fileName,
  };
}

export async function syncFrameworkToGitHub(
  framework: LocalFrameworkItem,
): Promise<GitHubFrameworkItem> {
  if (!framework.imagePath.startsWith('data:')) {
    throw new Error('只有保存为 dataURL 的本地图形可以同步到 GitHub。');
  }

  const response = await fetch('/api/github-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageDataUrl: framework.imagePath,
      framework: toFrameworkPayload(framework),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as GitHubUploadResponse;

  if (!response.ok || !payload.framework) {
    throw new Error(payload.error || `GitHub 同步失败：${response.status}`);
  }

  return toGitHubFrameworkItem(payload.framework);
}

export async function updateFrameworkMetadataOnGitHub(
  framework: FrameworkItem,
): Promise<GitHubFrameworkItem> {
  const response = await fetch('/api/github-upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'update-metadata',
      framework: toFrameworkPayload(framework),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as GitHubUploadResponse;

  if (!response.ok || !payload.framework) {
    throw new Error(payload.error || `GitHub 重新同步失败：${response.status}`);
  }

  return toGitHubFrameworkItem(payload.framework);
}
