import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Tablet, Eye, ExternalLink } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface PreviewModeProps {
  content: any;
  previewUrl?: string;
}

export const PreviewMode = ({ content, previewUrl = '/' }: PreviewModeProps) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isLivePreview, setIsLivePreview] = useState(false);

  const deviceDimensions = {
    desktop: { width: '100%', height: '800px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  const handleOpenInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  const handleToggleLivePreview = () => {
    setIsLivePreview(!isLivePreview);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Preview</h2>
          <p className="text-muted-foreground">
            See how your changes will look on different devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLivePreview ? "default" : "secondary"}>
            {isLivePreview ? 'Live Preview' : 'Static Preview'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLivePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isLivePreview ? 'Disable' : 'Enable'} Live Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Device Preview</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={device === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('desktop')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
              <Button
                variant={device === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('tablet')}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </Button>
              <Button
                variant={device === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDevice('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg flex items-center justify-center min-h-[600px]">
            <div
              style={{
                width: deviceDimensions[device].width,
                height: deviceDimensions[device].height,
                maxWidth: '100%',
                transition: 'all 0.3s ease'
              }}
              className="bg-background border rounded-lg shadow-lg overflow-hidden"
            >
              {isLivePreview ? (
                <iframe
                  src={previewUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Live Preview"
                />
              ) : (
                <div className="p-6 space-y-4">
                  <div className="text-center py-12">
                    <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      Enable Live Preview to see real-time changes
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click "Open in New Tab" to preview in a separate window
                    </p>
                  </div>

                  {/* Static preview of content */}
                  <div className="space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold">
                      {content.hero?.title || 'Preview Title'}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {content.hero?.subtitle || 'Preview subtitle'}
                    </p>
                    <p className="text-muted-foreground">
                      {content.hero?.description || 'Preview description...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Current viewport: {deviceDimensions[device].width} × {deviceDimensions[device].height}
          </div>
        </CardContent>
      </Card>

      {/* Before/After Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Before & After Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current (Published)</TabsTrigger>
              <TabsTrigger value="draft">Draft (Unsaved Changes)</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="mt-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-center text-muted-foreground">
                  Currently published version will appear here
                </p>
              </div>
            </TabsContent>
            <TabsContent value="draft" className="mt-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <p className="text-center text-muted-foreground">
                  Draft with your changes will appear here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

