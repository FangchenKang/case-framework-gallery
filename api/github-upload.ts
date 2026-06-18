declare const Buffer: {
  from(
    input: string | ArrayBuffer | Uint8Array,
    encoding?: BufferEncoding,
  ): { toString(encoding?: BufferEncoding): string };
};
declare const process: {
  env: Record<string, string | undefined>;
};

type BufferEncoding = 'base64' | 'utf8';

type ServerlessRequest = {
  method?: string;
  body?: unknown;
};

type ServerlessResponse = {
  status(code: number): ServerlessResponse;
  json(payload: unknown): void;
  setHeader(name: string, value: string): void;
};

type FrameworkFileType = 'svg' | 'png' | 'jpg';

type UploadFrameworkInput = {
  id?: string;
  title?: string;
  category?: string;
  type?: string;
  scene?: string;
  tags?: string[];
  description?: string;
  citation?: string;
  notes?: string;
  talkScript?: string;
  imagePath?: string;
  fileType?: FrameworkFileType;
  createdAt?: string;
  fileName?: string;
};

type UploadRequestBody = {
  action?: 'upload' | 'update-metadata';
  imageDataUrl?: string;
  imageContentBase64?: string;
  framework?: UploadFrameworkInput;
};

type GitHubContentFile = {
  sha: string;
  content?: string;
};

type GitHubFrameworkRecord = {
  id: string;
  title: string;
  category: string;
  type: string;
  scene: string;
  tags: string[];
  description: string;
  citation: string;
  notes: string;
  talkScript: string;
  imagePath: string;
  fileType: FrameworkFileType;
  sourceType: 'github';
  createdAt: string;
  updatedAt: string;
  fileName: string;
};

const GITHUB_API_VERSION = '2022-11-28';
const DATA_FILE_PATH = 'public/data/frameworks.json';
const IMAGE_DIR_PREFIX = 'public/frameworks/uploads';
const PUBLIC_IMAGE_PREFIX = '/frameworks/uploads';
const FILE_TYPES: FrameworkFileType[] = ['svg', 'png', 'jpg'];

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

function readEnv() {
  const values = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_OWNER: process.env.GITHUB_OWNER,
    GITHUB_REPO: process.env.GITHUB_REPO,
    GITHUB_BRANCH: process.env.GITHUB_BRANCH,
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`GitHub 环境变量未配置：${missing.join(', ')}`);
  }

  return {
    token: values.GITHUB_TOKEN,
    owner: values.GITHUB_OWNER,
    repo: values.GITHUB_REPO,
    branch: values.GITHUB_BRANCH,
  } as {
    token: string;
    owner: string;
    repo: string;
    branch: string;
  };
}

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function createRandomId() {
  return (
    globalThis.crypto?.randomUUID?.().replace(/-/g, '') ||
    `${Date.now()}${Math.random().toString(16).slice(2)}`
  );
}

function parseBody(body: unknown): UploadRequestBody {
  if (typeof body === 'string') {
    return JSON.parse(body) as UploadRequestBody;
  }

  if (body && typeof body === 'object') {
    return body as UploadRequestBody;
  }

  return {};
}

function sanitizeFileType(fileType: unknown): FrameworkFileType {
  if (FILE_TYPES.includes(fileType as FrameworkFileType)) {
    return fileType as FrameworkFileType;
  }

  throw new Error('fileType 必须是 svg、png 或 jpg。');
}

function sanitizeRequiredText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} 不能为空。`);
  }

  return value.trim();
}

function sanitizeOptionalText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim());
}

function getImageContentBase64(body: UploadRequestBody) {
  if (typeof body.imageContentBase64 === 'string' && body.imageContentBase64.trim()) {
    return body.imageContentBase64.trim();
  }

  if (typeof body.imageDataUrl !== 'string') {
    throw new Error('缺少图片 dataURL 或 base64 内容。');
  }

  const match = body.imageDataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);

  if (!match) {
    throw new Error('图片 dataURL 格式不正确。');
  }

  const isBase64 = Boolean(match[2]);
  const content = match[3] || '';

  if (isBase64) {
    return content;
  }

  return Buffer.from(decodeURIComponent(content), 'utf8').toString('base64');
}

function buildRecord(body: UploadRequestBody, publicImagePath: string): GitHubFrameworkRecord {
  const framework = body.framework || {};
  const fileType = sanitizeFileType(framework.fileType);
  const now = new Date().toISOString();
  const id = sanitizeOptionalText(framework.id) || `github-${createRandomId()}`;
  const title = sanitizeRequiredText(framework.title, 'title');

  return {
    id,
    title,
    category: sanitizeRequiredText(framework.category, 'category'),
    type: sanitizeRequiredText(framework.type, 'type'),
    scene: sanitizeRequiredText(framework.scene, 'scene'),
    tags: sanitizeTags(framework.tags),
    description: sanitizeRequiredText(framework.description, 'description'),
    citation: sanitizeOptionalText(framework.citation),
    notes: sanitizeOptionalText(framework.notes),
    talkScript: sanitizeOptionalText(framework.talkScript),
    imagePath: publicImagePath,
    fileType,
    sourceType: 'github',
    createdAt: sanitizeOptionalText(framework.createdAt) || now,
    updatedAt: now,
    fileName: sanitizeOptionalText(framework.fileName) || `${id}.${fileType}`,
  };
}

function buildMetadataUpdateRecord(
  body: UploadRequestBody,
  existingRecord: GitHubFrameworkRecord,
): GitHubFrameworkRecord {
  const framework = body.framework || {};
  const now = new Date().toISOString();
  const id = sanitizeRequiredText(framework.id, 'id');

  return {
    ...existingRecord,
    id,
    title: sanitizeRequiredText(framework.title, 'title'),
    category: sanitizeRequiredText(framework.category, 'category'),
    type: sanitizeRequiredText(framework.type, 'type'),
    scene: sanitizeRequiredText(framework.scene, 'scene'),
    tags: sanitizeTags(framework.tags),
    description: sanitizeRequiredText(framework.description, 'description'),
    citation: sanitizeOptionalText(framework.citation),
    notes: sanitizeOptionalText(framework.notes),
    talkScript: sanitizeOptionalText(framework.talkScript),
    fileType: framework.fileType ? sanitizeFileType(framework.fileType) : existingRecord.fileType,
    sourceType: 'github',
    createdAt: existingRecord.createdAt || sanitizeOptionalText(framework.createdAt) || now,
    updatedAt: now,
    fileName: sanitizeOptionalText(framework.fileName) || existingRecord.fileName,
  };
}

async function githubRequest(
  env: ReturnType<typeof readEnv>,
  path: string,
  init: RequestInit = {},
) {
  const method = init.method || 'GET';
  const ref = method === 'GET' ? `?ref=${encodeURIComponent(env.branch)}` : '';

  return fetch(
    `https://api.github.com/repos/${env.owner}/${env.repo}/contents/${encodePath(path)}${ref}`,
    {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${env.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'case-framework-gallery-vercel-function',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
        ...init.headers,
      },
    },
  );
}

async function getRepositoryFile(env: ReturnType<typeof readEnv>, path: string) {
  const response = await githubRequest(env, path, { method: 'GET' });

  if (response.status === 404) {
    return null;
  }

  const payload = (await response.json()) as GitHubContentFile | { message?: string };

  if (!response.ok) {
    const errorPayload = payload as { message?: string };
    throw new Error(errorPayload.message || `读取 GitHub 文件失败：${response.status}`);
  }

  if (!('sha' in payload)) {
    throw new Error('GitHub 返回内容不是文件。');
  }

  return payload;
}

async function putRepositoryFile(
  env: ReturnType<typeof readEnv>,
  path: string,
  contentBase64: string,
  message: string,
  sha?: string,
) {
  const response = await githubRequest(env, path, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: env.branch,
      ...(sha ? { sha } : {}),
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(payload.message || `写入 GitHub 文件失败：${response.status}`);
  }

  return payload;
}

function decodeGitHubContent(file: GitHubContentFile) {
  return Buffer.from((file.content || '').replace(/\n/g, ''), 'base64').toString('utf8');
}

function encodeJson(value: unknown) {
  return Buffer.from(JSON.stringify(value, null, 2), 'utf8').toString('base64');
}

function upsertRecord(records: GitHubFrameworkRecord[], record: GitHubFrameworkRecord) {
  const existingIndex = records.findIndex((item) => item.id === record.id);

  if (existingIndex >= 0) {
    const next = [...records];
    next[existingIndex] = record;
    return next;
  }

  return [...records, record];
}

function updateRecord(records: GitHubFrameworkRecord[], record: GitHubFrameworkRecord) {
  const existingIndex = records.findIndex((item) => item.id === record.id);

  if (existingIndex < 0) {
    throw new Error(`找不到 id 为 ${record.id} 的 GitHub 图形记录。`);
  }

  const next = [...records];
  next[existingIndex] = record;
  return next;
}

export default async function handler(request: ServerlessRequest, response: ServerlessResponse) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'POST') {
    response.status(405).json({ error: '只支持 POST 请求。' });
    return;
  }

  try {
    const env = readEnv();
    const body = parseBody(request.body);
    const action = body.action === 'update-metadata' ? 'update-metadata' : 'upload';

    if (action === 'update-metadata') {
      const existingDataFile = await getRepositoryFile(env, DATA_FILE_PATH);

      if (!existingDataFile) {
        throw new Error('public/data/frameworks.json 不存在，无法更新图形元数据。');
      }

      const existingRecords = JSON.parse(decodeGitHubContent(existingDataFile)) as unknown;

      if (!Array.isArray(existingRecords)) {
        throw new Error('public/data/frameworks.json 必须是 JSON 数组。');
      }

      const id = sanitizeRequiredText(body.framework?.id, 'id');
      const existingRecord = (existingRecords as GitHubFrameworkRecord[]).find(
        (item) => item.id === id,
      );

      if (!existingRecord) {
        throw new Error(`找不到 id 为 ${id} 的 GitHub 图形记录。`);
      }

      const record = buildMetadataUpdateRecord(body, existingRecord);
      const commitMessage = `Update framework: ${record.title}`;

      await putRepositoryFile(
        env,
        DATA_FILE_PATH,
        encodeJson(updateRecord(existingRecords as GitHubFrameworkRecord[], record)),
        commitMessage,
        existingDataFile.sha,
      );

      response.status(200).json({ framework: record });
      return;
    }

    const fileType = sanitizeFileType(body.framework?.fileType);
    const date = new Date().toISOString().slice(0, 10);
    const imageId = createRandomId();
    const imageRepositoryPath = `${IMAGE_DIR_PREFIX}/${date}/${imageId}.${fileType}`;
    const publicImagePath = `${PUBLIC_IMAGE_PREFIX}/${date}/${imageId}.${fileType}`;
    const imageContentBase64 = getImageContentBase64(body);
    const record = buildRecord(body, publicImagePath);
    const commitMessage = `Add framework: ${record.title}`;

    await putRepositoryFile(env, imageRepositoryPath, imageContentBase64, commitMessage);

    const existingDataFile = await getRepositoryFile(env, DATA_FILE_PATH);
    const existingRecords = existingDataFile
      ? (JSON.parse(decodeGitHubContent(existingDataFile)) as unknown)
      : [];

    if (!Array.isArray(existingRecords)) {
      throw new Error('public/data/frameworks.json 必须是 JSON 数组。');
    }

    await putRepositoryFile(
      env,
      DATA_FILE_PATH,
      encodeJson(upsertRecord(existingRecords as GitHubFrameworkRecord[], record)),
      commitMessage,
      existingDataFile?.sha,
    );

    response.status(200).json({ framework: record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub 同步失败。';
    response.status(500).json({ error: message });
  }
}
