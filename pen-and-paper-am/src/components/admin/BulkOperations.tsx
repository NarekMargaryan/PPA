import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Eye, EyeOff, Download, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkOperationsProps {
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onDeselectAll: () => void;
  onDelete: (ids: string[]) => void;
  onToggleVisibility?: (ids: string[], visible: boolean) => void;
  onExport?: (ids: string[]) => void;
  onDuplicate?: (ids: string[]) => void;
  totalItems: number;
  itemType?: string;
}

export const BulkOperations = ({
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onToggleVisibility,
  onExport,
  onDuplicate,
  totalItems,
  itemType = 'items'
}: BulkOperationsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const hasSelection = selectedIds.length > 0;
  const allSelected = selectedIds.length === totalItems && totalItems > 0;

  const handleDeleteConfirm = () => {
    onDelete(selectedIds);
    setShowDeleteDialog(false);
    onDeselectAll();
  };

  const handleToggleVisibility = (visible: boolean) => {
    if (onToggleVisibility) {
      onToggleVisibility(selectedIds, visible);
      onDeselectAll();
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(selectedIds);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(selectedIds);
      onDeselectAll();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-muted/50 p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSelectAll(true);
                } else {
                  onDeselectAll();
                }
              }}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select all
            </label>
          </div>

          {hasSelection && (
            <Badge variant="secondary">
              {selectedIds.length} {itemType} selected
            </Badge>
          )}
        </div>

        {hasSelection && (
          <div className="flex flex-wrap items-center gap-2">
            {onToggleVisibility && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVisibility(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Show
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleVisibility(false)}
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </Button>
              </>
            )}

            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            )}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedIds.length} {itemType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface BulkCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const BulkCheckbox = ({ id, checked, onCheckedChange }: BulkCheckboxProps) => {
  return (
    <Checkbox
      id={`bulk-${id}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

