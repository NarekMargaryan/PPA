export const CONTACT_SUBMISSION_STORAGE_KEY = 'ppa_contact_submissions';
export const CONTACT_SUBMISSION_UPDATED_EVENT = 'ppa-contact-submissions-updated';

type ContactSubmissionStorageMode = 'local' | 'session' | 'memory';

export type ContactSubmissionStatus =
  | 'new'
  | 'in_progress'
  | 'contacted'
  | 'resolved'
  | 'archived';

export interface ContactSubmission {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  startDate: string;
  message: string;
  language: 'en' | 'hy';
  source: string;
  status: ContactSubmissionStatus;
  statusUpdatedAt: string;
}

interface ContactSubmissionPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  course?: string;
  startDate?: string;
  message?: string;
  language: 'en' | 'hy';
  source?: string;
}

const MEMORY_STORAGE = new Map<string, string>();

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const asLanguage = (value: unknown): 'en' | 'hy' =>
  value === 'hy' ? 'hy' : 'en';

const isStatus = (value: unknown): value is ContactSubmissionStatus =>
  value === 'new' ||
  value === 'in_progress' ||
  value === 'contacted' ||
  value === 'resolved' ||
  value === 'archived';

const asStatus = (value: unknown): ContactSubmissionStatus =>
  isStatus(value) ? value : 'new';

const canUseStorage = (storage?: Storage): storage is Storage => {
  if (!storage) {
    return false;
  }

  try {
    const probeKey = '__ppa_contact_storage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
};

const getStorageMode = (): ContactSubmissionStorageMode => {
  if (typeof window === 'undefined') {
    return 'memory';
  }

  if (canUseStorage(window.localStorage)) {
    return 'local';
  }

  if (canUseStorage(window.sessionStorage)) {
    return 'session';
  }

  return 'memory';
};

export const getContactSubmissionStorageMode = (): ContactSubmissionStorageMode =>
  getStorageMode();

const readStorageValue = (key: string): string | null => {
  const mode = getStorageMode();

  if (mode === 'local') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  if (mode === 'session') {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return MEMORY_STORAGE.get(key) ?? null;
};

const writeStorageValue = (key: string, value: string): void => {
  const mode = getStorageMode();

  if (mode === 'local') {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // fall through to next storage type
    }
  }

  if (mode === 'session') {
    try {
      window.sessionStorage.setItem(key, value);
      return;
    } catch {
      // fall through to in-memory storage
    }
  }

  MEMORY_STORAGE.set(key, value);
};

const removeStorageValue = (key: string): void => {
  const mode = getStorageMode();

  if (mode === 'local') {
    try {
      window.localStorage.removeItem(key);
      return;
    } catch {
      // fall through
    }
  }

  if (mode === 'session') {
    try {
      window.sessionStorage.removeItem(key);
      return;
    } catch {
      // fall through
    }
  }

  MEMORY_STORAGE.delete(key);
};

const dispatchContactSubmissionUpdate = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(CONTACT_SUBMISSION_UPDATED_EVENT));
};

export const getContactSubmissionStatusLabel = (status: ContactSubmissionStatus): string => {
  switch (status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'contacted':
      return 'Contacted';
    case 'resolved':
      return 'Resolved';
    case 'archived':
      return 'Archived';
    default:
      return 'New';
  }
};

export const readContactSubmissions = (): ContactSubmission[] => {
  const raw = readStorageValue(CONTACT_SUBMISSION_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isObjectRecord)
      .map((item) => {
        const createdAt = asString(item.createdAt) || new Date().toISOString();
        const status = asStatus(item.status);
        return {
          id: asString(item.id) || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt,
          firstName: asString(item.firstName),
          lastName: asString(item.lastName),
          email: asString(item.email),
          phone: asString(item.phone),
          course: asString(item.course),
          startDate: asString(item.startDate),
          message: asString(item.message),
          language: asLanguage(item.language),
          source: asString(item.source) || '/contact',
          status,
          statusUpdatedAt: asString(item.statusUpdatedAt) || createdAt
        };
      })
      .filter((item) => item.email && (item.firstName || item.lastName));
  } catch {
    return [];
  }
};

export const writeContactSubmissions = (submissions: ContactSubmission[]): void => {
  if (submissions.length === 0) {
    removeStorageValue(CONTACT_SUBMISSION_STORAGE_KEY);
    dispatchContactSubmissionUpdate();
    return;
  }

  writeStorageValue(CONTACT_SUBMISSION_STORAGE_KEY, JSON.stringify(submissions));
  dispatchContactSubmissionUpdate();
};

export const addContactSubmission = (payload: ContactSubmissionPayload): ContactSubmission => {
  const now = new Date().toISOString();
  const submission: ContactSubmission = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: now,
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim(),
    phone: payload.phone?.trim() || '',
    course: payload.course?.trim() || '',
    startDate: payload.startDate?.trim() || '',
    message: payload.message?.trim() || '',
    language: payload.language,
    source: payload.source?.trim() || '/contact',
    status: 'new',
    statusUpdatedAt: now
  };

  const current = readContactSubmissions();
  writeContactSubmissions([submission, ...current]);
  return submission;
};

export const updateContactSubmissionStatus = (
  submissionId: string,
  status: ContactSubmissionStatus
): ContactSubmission[] => {
  const now = new Date().toISOString();
  const updated = readContactSubmissions().map((item) =>
    item.id === submissionId
      ? {
          ...item,
          status,
          statusUpdatedAt: now
        }
      : item
  );
  writeContactSubmissions(updated);
  return updated;
};
