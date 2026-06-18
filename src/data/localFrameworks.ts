import type { FrameworkItem } from './frameworks';

const DATABASE_NAME = 'case-framework-gallery';
const DATABASE_VERSION = 1;
const STORE_NAME = 'local-frameworks';

export type LocalFrameworkItem = FrameworkItem & {
  source: 'local';
  createdAt: string;
  fileName: string;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
          database.close();
          reject(transaction.error);
        };
      }),
  );
}

export async function getLocalFrameworks(): Promise<LocalFrameworkItem[]> {
  return runStore<LocalFrameworkItem[]>('readonly', (store) => store.getAll());
}

export async function saveLocalFramework(framework: LocalFrameworkItem): Promise<void> {
  await runStore<IDBValidKey>('readwrite', (store) => store.put(framework));
}

export async function deleteLocalFramework(id: string): Promise<void> {
  await runStore<undefined>('readwrite', (store) => store.delete(id));
}

export async function importLocalFrameworks(
  frameworks: LocalFrameworkItem[],
): Promise<LocalFrameworkItem[]> {
  const existing = await getLocalFrameworks();
  const existingIds = new Set(existing.map((item) => item.id));
  const savedItems: LocalFrameworkItem[] = [];

  for (const framework of frameworks) {
    const id = existingIds.has(framework.id)
      ? `${framework.id}-${crypto.randomUUID()}`
      : framework.id;
    const item = {
      ...framework,
      id,
      source: 'local' as const,
      createdAt: framework.createdAt || new Date().toISOString(),
    };

    await saveLocalFramework(item);
    existingIds.add(id);
    savedItems.push(item);
  }

  return savedItems;
}

export function createLocalFrameworkId() {
  return `local-${crypto.randomUUID()}`;
}

