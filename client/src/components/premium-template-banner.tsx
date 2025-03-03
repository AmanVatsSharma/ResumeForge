import React from 'react';
import { Lock, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PremiumTemplateBannerProps {
  templateName: string;
  onUpgrade: () => void;
}

export function PremiumTemplateBanner({
  templateName,
  onUpgrade
}: PremiumTemplateBannerProps) {
  return (
    <Card className="mb-4 border-yellow-300 bg-gradient-to-r from-amber-50 to-yellow-50 overflow-hidden">
      <CardContent className="p-4 pt-4 relative">
        <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 opacity-10">
          <Crown className="w-full h-full text-yellow-500" />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                Premium Template
              </Badge>
              <h3 className="text-lg font-medium">{templateName}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              You're using a premium template. Feel free to explore and customize it, 
              but you'll need to upgrade to export or share this design.
            </p>
          </div>
          
          <Button 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shrink-0"
            size="sm"
          >
            <Lock className="mr-2 h-3.5 w-3.5" />
            Unlock Premium Templates
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 