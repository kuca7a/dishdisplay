"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { menuItemService } from "@/lib/database";
import { MenuItem, UpdateMenuItemData } from "@/types/database";

interface EditMenuItemFormProps {
  item: MenuItem;
  onSuccess: (updatedItem: MenuItem) => void;
  trigger?: React.ReactNode;
}

const categories = [
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'main', label: 'Main Course' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'drink', label: 'Drink' },
];

export function EditMenuItemForm({ item, onSuccess, trigger }: EditMenuItemFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    price: item.price.toString(),
    category: item.category,
    image_url: item.image_url || "",
    is_available: item.is_available,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      setLoading(true);
      
      const updateData: UpdateMenuItemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: price,
        category: formData.category as any,
        image_url: formData.image_url.trim() || undefined,
        is_available: formData.is_available,
      };

      const updatedItem = await menuItemService.update(item.id, updateData);
      
      setOpen(false);
      onSuccess(updatedItem);
      
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("Failed to update menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form data when item changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        category: item.category,
        image_url: item.image_url || "",
        is_available: item.is_available,
      });
    }
  }, [open, item]);

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
          <DialogDescription>
            Update the details of your menu item. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-item-name">Item Name *</Label>
            <Input
              id="edit-item-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Margherita Pizza"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-item-description">Description</Label>
            <Textarea
              id="edit-item-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your dish..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-item-price">Price (£) *</Label>
              <Input
                id="edit-item-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="12.99"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-item-category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as MenuItem['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="edit-item-image">Image URL (Optional)</Label>
            <Input
              id="edit-item-image"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a link to an image of your dish
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-item-available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <Label htmlFor="edit-item-available">Available for order</Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim() || !formData.price || !formData.category}
              className="flex-1"
            >
              {loading ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
