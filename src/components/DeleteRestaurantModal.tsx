"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteRestaurantModalProps {
  restaurantName: string;
  menuItemCount: number;
  onConfirm: () => void;
  trigger?: React.ReactNode;
  loading?: boolean;
}

export function DeleteRestaurantModal({ 
  restaurantName, 
  menuItemCount,
  onConfirm, 
  trigger,
  loading = false 
}: DeleteRestaurantModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (confirmText !== restaurantName) {
      alert("Please type the restaurant name exactly as shown to confirm deletion.");
      return;
    }
    onConfirm();
    setOpen(false);
    setConfirmText("");
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete Restaurant
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setConfirmText("");
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete Restaurant</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone and will permanently delete everything.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ Warning: Complete Data Loss</h4>
            <p className="text-sm text-red-700">
              Deleting your restaurant will permanently remove:
            </p>
            <ul className="text-sm text-red-700 mt-2 list-disc list-inside space-y-1">
              <li>Restaurant profile and information</li>
              <li>All {menuItemCount} menu items</li>
              <li>All customer access to your menu</li>
              <li>All associated data</li>
            </ul>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">
              To confirm deletion, please type the restaurant name exactly:
            </p>
            <p className="font-semibold text-gray-900 mb-2 p-2 bg-gray-100 rounded">
              {restaurantName}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type restaurant name here"
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              setConfirmText("");
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading || confirmText !== restaurantName}
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
                Delete Restaurant Forever
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
