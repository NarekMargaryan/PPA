export const CONTACT_SUBMISSION_STORAGE_KEY = 'ppa_contact_submissions';

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
  const raw = localStorage.getItem(CONTACT_SUBMISSION_STORAGE_KEY);
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
  localStorage.setItem(CONTACT_SUBMISSION_STORAGE_KEY, JSON.stringify(submissions));
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
