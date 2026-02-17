import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, GraduationCap, HelpCircle, 
  Image, Users, Download, Eye, Mail
} from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const actions = [
  { id: 'new-announcement', icon: Megaphone, label: 'New Announcement', color: 'bg-blue-500' },
  { id: 'new-course', icon: GraduationCap, label: 'New Course', color: 'bg-green-500' },
  { id: 'new-faq', icon: HelpCircle, label: 'Add FAQ', color: 'bg-purple-500' },
  { id: 'upload-image', icon: Image, label: 'Upload Image', color: 'bg-orange-500' },
  { id: 'contact-requests', icon: Mail, label: 'Contact Requests', color: 'bg-indigo-500' },
  { id: 'preview-site', icon: Eye, label: 'Preview Site', color: 'bg-pink-500' },
  { id: 'export-data', icon: Download, label: 'Export Data', color: 'bg-teal-500' },
  { id: 'manage-users', icon: Users, label: 'Manage Users', color: 'bg-red-500' },
];

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map(action => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto flex-col gap-2 p-4 hover:shadow-md transition-all"
              onClick={() => onActionClick(action.id)}
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

