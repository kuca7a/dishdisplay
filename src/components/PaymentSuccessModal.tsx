import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentSuccessModal({
  open,
  onClose,
}: PaymentSuccessModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <AlertDialogTitle className="text-2xl flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Payment Successful!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Welcome to DishDisplay Pro! Your subscription is now active and you
            have access to all premium features.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What's included:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✨ Unlimited menu items</li>
            <li>✨ Unlimited QR codes</li>
            <li>✨ Advanced analytics</li>
            <li>✨ Custom branding</li>
            <li>✨ Priority support</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Get Started with Pro
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
