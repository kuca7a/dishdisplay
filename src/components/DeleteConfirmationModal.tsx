"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  itemName: string;
  onConfirm: () => void;
  trigger?: React.ReactNode;
  loading?: boolean;
}

export function DeleteConfirmationModal({ 
  itemName, 
  onConfirm, 
  trigger,
  loading = false 
}: DeleteConfirmationModalProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Menu Item</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>"{itemName}"</strong> from your menu? 
            This will permanently remove the item and it will no longer be visible to customers.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
