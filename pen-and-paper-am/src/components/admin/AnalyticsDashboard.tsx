import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Overview</h2>
        <p className="text-muted-foreground">
          Connect GA4 to view traffic and engagement data in this panel.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Add <code className="bg-muted px-1 py-0.5 rounded">VITE_GA_MEASUREMENT_ID</code> in your
          deployment environment and keep analytics consent enabled for data collection.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Integration Steps</CardTitle>
          <CardDescription>Checklist for production analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Configure GA4 property and measurement ID.</p>
          <p>2. Add measurement ID in Netlify environment variables.</p>
          <p>3. Deploy and accept analytics consent on the live site.</p>
          <p>4. Validate events in GA4 Realtime and DebugView.</p>
        </CardContent>
      </Card>
    </div>
  );
};
