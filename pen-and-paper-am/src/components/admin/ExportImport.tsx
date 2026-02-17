import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileJson, AlertCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

interface ExportImportProps {
  getExportData: () => Record<string, unknown>;
  onImport: (data: Record<string, unknown>) => void;
  onCleanup?: () => void;
  filename?: string;
}

type UnresolvedAsset = {
  path: string;
  url: string;
  reason: string;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDataUrl = (value: string): boolean => value.startsWith('data:');

const looksLikeHtmlWithImage = (value: string): boolean => /<img[\s\S]*?>/i.test(value);

const toAbsoluteUrl = (rawUrl: string): string => {
  try {
    return new URL(rawUrl, window.location.origin).toString();
  } catch {
    return rawUrl;
  }
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });

const shouldTryEmbedUrl = (value: string): boolean =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('/') ||
  value.startsWith('./') ||
  value.startsWith('../') ||
  value.startsWith('blob:');

const shouldTreatAsImageField = (path: string[]): boolean => {
  const normalized = path.map((segment) => segment.toLowerCase());
  const key = normalized[normalized.length - 1] || '';
  const parent = normalized[normalized.length - 2] || '';
  return key.includes('image') || parent.includes('images');
};

const normalizeImportPayload = (value: unknown): Record<string, unknown> | null => {
  if (!isObjectRecord(value)) return null;
  return value;
};

export const ExportImport = ({ getExportData, onImport, onCleanup, filename = 'ppa-backup' }: ExportImportProps) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [exportInfo, setExportInfo] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const buildPortableBackup = async (raw: Record<string, unknown>): Promise<{
    backup: Record<string, unknown>;
    unresolved: UnresolvedAsset[];
  }> => {
    const unresolved: UnresolvedAsset[] = [];
    const fetchCache = new Map<string, Promise<string>>();

    const embedImageUrl = async (value: string, path: string[]): Promise<string> => {
      if (!value || isDataUrl(value) || !shouldTryEmbedUrl(value)) {
        return value;
      }

      const absoluteUrl = toAbsoluteUrl(value);
      let fetchPromise = fetchCache.get(absoluteUrl);

      if (!fetchPromise) {
        fetchPromise = (async () => {
          const response = await fetch(absoluteUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const blob = await response.blob();
          if (!blob.type.startsWith('image/')) {
            throw new Error(`Not an image (${blob.type || 'unknown type'})`);
          }

          return blobToDataUrl(blob);
        })();

        fetchCache.set(absoluteUrl, fetchPromise);
      }

      try {
        return await fetchPromise;
      } catch (error) {
        unresolved.push({
          path: path.join('.'),
          url: value,
          reason: error instanceof Error ? error.message : 'Unknown fetch error'
        });
        return value;
      }
    };

    const transformHtmlImages = async (html: string, path: string[]): Promise<string> => {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const images = Array.from(doc.querySelectorAll('img[src]'));

        for (const img of images) {
          const src = img.getAttribute('src');
          if (!src) continue;
          const embedded = await embedImageUrl(src, [...path, 'img-src']);
          img.setAttribute('src', embedded);
        }

        return doc.body.innerHTML;
      } catch {
        return html;
      }
    };

    const transformNode = async (node: unknown, path: string[]): Promise<unknown> => {
      if (Array.isArray(node)) {
        const transformedArray: unknown[] = [];
        for (let index = 0; index < node.length; index += 1) {
          transformedArray.push(await transformNode(node[index], [...path, String(index)]));
        }
        return transformedArray;
      }

      if (isObjectRecord(node)) {
        const transformedObject: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(node)) {
          transformedObject[key] = await transformNode(value, [...path, key]);
        }
        return transformedObject;
      }

      if (typeof node === 'string') {
        if (looksLikeHtmlWithImage(node)) {
          return transformHtmlImages(node, path);
        }

        if (shouldTreatAsImageField(path)) {
          return embedImageUrl(node, path);
        }
      }

      return node;
    };

    const transformed = await transformNode(raw, []);
    const backup = isObjectRecord(transformed) ? transformed : raw;

    const backupMeta = isObjectRecord(backup.backupMeta) ? backup.backupMeta : {};
    backup.backupMeta = {
      ...backupMeta,
      mode: 'portable-embedded-images',
      exportedAt: new Date().toISOString(),
      unresolvedAssetCount: unresolved.length
    };

    return { backup, unresolved };
  };

  const handleExportJSON = async () => {
    setExportInfo(null);
    setExportError(null);
    setIsExporting(true);

    try {
      const rawData = getExportData();
      const { backup, unresolved } = await buildPortableBackup(rawData);
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      link.click();
      URL.revokeObjectURL(url);

      if (unresolved.length > 0) {
        setExportError(`Backup exported with ${unresolved.length} unresolved image URL(s). These URLs stayed as-is.`);
      } else {
        setExportInfo('Portable backup exported successfully. Image assets were embedded.');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Backup export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        const normalized = normalizeImportPayload(importedData);

        if (!normalized) {
          throw new Error('Invalid data format');
        }

        onImport(normalized);
      } catch (error) {
        setImportError('Failed to import file. Please check the backup format.');
        console.error('Import error:', error);
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Backup & Restore</h2>
        <p className="text-muted-foreground">
          Export and restore full admin-managed website data, including embedded image assets
        </p>
      </div>

      {exportInfo && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{exportInfo}</AlertDescription>
        </Alert>
      )}

      {exportError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Create Portable Backup
            </CardTitle>
            <CardDescription>
              Download full site backup as JSON
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="w-full justify-start"
              disabled={isExporting}
            >
              <FileJson className="h-4 w-4 mr-2" />
              {isExporting ? 'Preparing Backup...' : 'Export Full Backup (JSON)'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Includes content, announcements, courses, FAQ, images, contact requests, admin users, and activity logs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Backup
            </CardTitle>
            <CardDescription>
              Import from a backup JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleImportClick}
              variant="outline"
              className="w-full justify-start"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Import Backup JSON
            </Button>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Warning:</strong> Import replaces current admin-managed data. Export a backup first.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Cleanup
            </CardTitle>
            <CardDescription>
              Reset saved website content data to defaults
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => onCleanup?.()}
              variant="destructive"
              className="w-full justify-start"
              disabled={!onCleanup}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Run Cleanup
            </Button>
            <p className="text-xs text-muted-foreground">
              Requires admin password confirmation before cleanup starts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
