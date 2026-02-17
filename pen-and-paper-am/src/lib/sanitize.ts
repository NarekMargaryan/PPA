import DOMPurify from "dompurify";

const RICH_TEXT_KEYS = new Set(["answer", "content"]);

const richTextConfig: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "span",
    "code",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class"],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
  FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
};

const plainTextConfig: DOMPurify.Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
};

export const sanitizeRichText = (value: string): string =>
  DOMPurify.sanitize(value, richTextConfig);

export const sanitizePlainText = (value: string): string =>
  DOMPurify.sanitize(value, plainTextConfig);

export const stripHtml = (value: string): string =>
  sanitizePlainText(value).replace(/\s+/g, " ").trim();

export const sanitizeUnknown = (value: unknown, path: string[] = []): unknown => {
  if (typeof value === "string") {
    const key = path[path.length - 1] ?? "";
    return RICH_TEXT_KEYS.has(key) ? sanitizeRichText(value) : sanitizePlainText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeUnknown(item, [...path, String(index)]));
  }

  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeUnknown(item, [...path, key]);
    }
    return result;
  }

  return value;
};
