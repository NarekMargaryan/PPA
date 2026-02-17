import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MultilingualEditorProps {
  enValue: string;
  hyValue: string;
  onEnChange: (value: string) => void;
  onHyChange: (value: string) => void;
  label: string;
  type?: 'input' | 'textarea';
  placeholder?: { en: string; hy: string };
}

export const MultilingualEditor = ({
  enValue,
  hyValue,
  onEnChange,
  onHyChange,
  label,
  type = 'input',
  placeholder = { en: 'Enter English text...', hy: 'Մուտքագրեք հայերեն տեքստ...' }
}: MultilingualEditorProps) => {
  const [viewMode, setViewMode] = useState<'tabs' | 'side-by-side'>('tabs');
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const handleCopyToArmenian = () => {
    onHyChange(enValue);
    setShowCopyAlert(true);
    setTimeout(() => setShowCopyAlert(false), 2000);
  };

  const enProgress = enValue ? 100 : 0;
  const hyProgress = hyValue ? 100 : 0;
  const translationComplete = enProgress === 100 && hyProgress === 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          {label}
        </Label>
        <div className="flex items-center gap-2">
          {translationComplete ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Translation needed
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'tabs' ? 'side-by-side' : 'tabs')}
          >
            {viewMode === 'tabs' ? 'Side-by-Side' : 'Tabs'}
          </Button>
        </div>
      </div>

      {showCopyAlert && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Copied to Armenian field!</AlertDescription>
        </Alert>
      )}

      {viewMode === 'tabs' ? (
        <Tabs defaultValue="en" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en" className="gap-2">
              🇺🇸 English
              <Badge variant="outline" className="ml-auto">{enProgress}%</Badge>
            </TabsTrigger>
            <TabsTrigger value="hy" className="gap-2">
              🇦🇲 Հայերեն
              <Badge variant="outline" className="ml-auto">{hyProgress}%</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="en" className="space-y-2">
            {type === 'input' ? (
              <Input
                value={enValue}
                onChange={(e) => onEnChange(e.target.value)}
                placeholder={placeholder.en}
              />
            ) : (
              <Textarea
                value={enValue}
                onChange={(e) => onEnChange(e.target.value)}
                placeholder={placeholder.en}
                rows={4}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToArmenian}
              disabled={!enValue}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy to Armenian
            </Button>
          </TabsContent>
          
          <TabsContent value="hy" className="space-y-2">
            {type === 'input' ? (
              <Input
                value={hyValue}
                onChange={(e) => onHyChange(e.target.value)}
                placeholder={placeholder.hy}
              />
            ) : (
              <Textarea
                value={hyValue}
                onChange={(e) => onHyChange(e.target.value)}
                placeholder={placeholder.hy}
                rows={4}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>🇺🇸 English</Label>
              <Badge variant="outline">{enProgress}%</Badge>
            </div>
            {type === 'input' ? (
              <Input
                value={enValue}
                onChange={(e) => onEnChange(e.target.value)}
                placeholder={placeholder.en}
              />
            ) : (
              <Textarea
                value={enValue}
                onChange={(e) => onEnChange(e.target.value)}
                placeholder={placeholder.en}
                rows={4}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCopyToArmenian}
              disabled={!enValue}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copy to Armenian →
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>🇦🇲 Հայերեն</Label>
              <Badge variant="outline">{hyProgress}%</Badge>
            </div>
            {type === 'input' ? (
              <Input
                value={hyValue}
                onChange={(e) => onHyChange(e.target.value)}
                placeholder={placeholder.hy}
              />
            ) : (
              <Textarea
                value={hyValue}
                onChange={(e) => onHyChange(e.target.value)}
                placeholder={placeholder.hy}
                rows={4}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const TranslationProgress = ({ enContent, hyContent }: { enContent: any; hyContent: any }) => {
  const calculateProgress = (obj: any): number => {
    if (!obj) return 0;
    
    let total = 0;
    let filled = 0;

    const traverse = (o: any) => {
      Object.keys(o).forEach(key => {
        if (typeof o[key] === 'string') {
          total++;
          if (o[key] && o[key].trim().length > 0) filled++;
        } else if (typeof o[key] === 'object' && o[key] !== null) {
          traverse(o[key]);
        }
      });
    };

    traverse(obj);
    return total > 0 ? Math.round((filled / total) * 100) : 0;
  };

  const enProgress = calculateProgress(enContent);
  const hyProgress = calculateProgress(hyContent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="h-5 w-5" />
          Translation Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">🇺🇸 English</span>
            <span className="text-sm font-bold">{enProgress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${enProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">🇦🇲 Հայերեն</span>
            <span className="text-sm font-bold">{hyProgress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300" 
              style={{ width: `${hyProgress}%` }}
            />
          </div>
        </div>

        {enProgress === 100 && hyProgress === 100 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All translations are complete! 🎉
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

