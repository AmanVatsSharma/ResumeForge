import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "template" | "subscription";
  templateId?: string;
  name: string;
  price: number;
}

export function PaymentDialog({
  open,
  onOpenChange,
  type,
  templateId,
  name,
  price,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const initiatePaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/payments/initiate", {
        type,
        templateId,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to PhonePe payment page
      window.location.href = data.paymentUrl;
    },
    onError: (error: Error) => {
      setIsLoading(false);
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    setIsLoading(true);
    initiatePaymentMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "subscription" ? "Upgrade to Premium" : "Premium Template"}
          </DialogTitle>
          <DialogDescription>
            {type === "subscription" ? (
              <>
                <p className="mb-4">
                  Upgrade to Premium to unlock:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>Unlimited resume generation</li>
                  <li>Access to all premium templates</li>
                  <li>Priority support</li>
                  <li>Advanced AI features</li>
                </ul>
              </>
            ) : (
              <p className="mb-4">
                "{name}" is a premium template that will enhance your resume's professional appearance.
              </p>
            )}
            <p className="font-medium">
              Price: ₹{price}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePayment} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pay with PhonePe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
