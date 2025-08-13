"use client";

import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Restaurant } from "@/types/database";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  user: {
    email?: string;
    name?: string;
    nickname?: string;
  } | null;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  restaurant,
  user
}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth0();

  const restaurantName = restaurant?.name || "";
  const isConfirmationValid = confirmationText === restaurantName;

  const handleDelete = async () => {
    if (!isConfirmationValid || !restaurant || !user?.email) return;

    try {
      setIsDeleting(true);
      setError(null);

      // Call the deletion API
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          userEmail: user.email,
          confirmationText: confirmationText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Account deleted successfully
      // Logout and redirect to home page
      await logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });

    } catch (err) {
      console.error('Account deletion error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while deleting
    setConfirmationText("");
    setError(null);
    onClose();
  };

  if (!restaurant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <DialogTitle className="text-red-700">Delete Account</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            This action <strong>cannot be undone</strong>. This will permanently delete your account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* What will be deleted */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">The following will be permanently deleted:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Restaurant profile: <strong>"{restaurant.name}"</strong></li>
              <li>• All menu items and categories</li>
              <li>• All uploaded images and media</li>
              <li>• QR codes (will stop working immediately)</li>
              <li>• Analytics and insights data</li>
              <li>• Account settings and preferences</li>
            </ul>
          </div>

          {/* Confirmation input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              To confirm deletion, type your restaurant name: <strong>{restaurantName}</strong>
            </Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type restaurant name here"
              disabled={isDeleting}
              className={`${
                confirmationText && !isConfirmationValid 
                  ? "border-red-300 focus:border-red-500" 
                  : ""
              }`}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-red-600">
                Restaurant name doesn't match. Please type exactly: {restaurantName}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmationValid || isDeleting}
              className="bg-red-600 hover:bg-red-700 min-w-[120px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </div>

          {/* Additional warning */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>
              <strong>Note:</strong> Payment records may be retained for legal and tax compliance requirements. 
              All personal identifying information will be removed from these records.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
