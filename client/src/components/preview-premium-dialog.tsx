import React from 'react';
import { Crown, Sparkles, Eye, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTemplateName } from '@/components/templates';

interface PreviewPremiumDialogProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onUpgrade: () => void;
}

export function PreviewPremiumDialog({
  templateId,
  open,
  onOpenChange,
  onConfirm,
  onUpgrade
}: PreviewPremiumDialogProps) {
  const templateName = getTemplateName(templateId);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Premium Template Preview
          </DialogTitle>
          <DialogDescription>
            You're about to preview a premium template
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2 text-amber-800">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {templateName}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              This is a premium template that requires a subscription to export or share.
              You can preview it once with watermarks to see how it looks with your content.
            </p>
            <p className="text-sm font-medium text-amber-700 mt-3">
              Note: You can only preview each premium template once per resume.
              After you switch to another template, you'll need to upgrade to use this template again.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:order-1 order-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onUpgrade}
            className="sm:order-2 order-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            variant="secondary"
            className="sm:order-3 order-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Once
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 