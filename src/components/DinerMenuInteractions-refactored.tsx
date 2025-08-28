"use client";

import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Restaurant } from "@/types/database";
import { useDinerActions } from "@/hooks/use-diner-actions";
import GuestLoginCard from "./GuestLoginCard";
import SuccessMessage from "./SuccessMessage";
import ActionMenu from "./ActionMenu";
import VisitDialog from "./VisitDialog";
import ReviewDialog from "./ReviewDialog";
import EarnPointsModal from "./EarnPointsModal";

interface DinerMenuInteractionsProps {
  restaurant: Restaurant;
}

export default function DinerMenuInteractions({
  restaurant,
}: DinerMenuInteractionsProps) {
  const { isAuthenticated, isLoading, user } = useAuth0();

  // Dialog state management
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showEarnPointsModal, setShowEarnPointsModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "review" | "photo-review" | null
  >(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Custom hook for all diner actions
  const dinerActions = useDinerActions(restaurant, setSuccessMessage);

  // Handle action selection from earn points modal
  const handleSelectAction = (action: "visit" | "review" | "photo-review") => {
    setSelectedAction(action === "visit" ? null : action);

    switch (action) {
      case "visit":
        setShowVisitDialog(true);
        break;
      case "review":
        setShowReviewDialog(true);
        break;
      case "photo-review":
        setShowReviewDialog(true);
        break;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F7161]"></div>
      </div>
    );
  }

  // Show guest login card if not authenticated
  if (!isAuthenticated) {
    return <GuestLoginCard />;
  }

  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {/* Main Action Menu */}
      <ActionMenu
        userEmail={user?.email}
        onEarnPoints={() => setShowEarnPointsModal(true)}
      />

      {/* Earn Points Modal */}
      <EarnPointsModal
        open={showEarnPointsModal}
        onOpenChange={setShowEarnPointsModal}
        onSelectAction={handleSelectAction}
      />

      {/* Visit Dialog */}
      <VisitDialog
        open={showVisitDialog}
        onOpenChange={setShowVisitDialog}
        onConfirm={dinerActions.handleLogVisit}
        isSubmitting={dinerActions.isSubmitting}
        restaurantName={restaurant.name}
      />

      {/* Review Dialog */}
      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        onSubmit={dinerActions.handleSubmitReview}
        selectedAction={selectedAction}
        rating={dinerActions.rating}
        onRatingChange={dinerActions.setRating}
        reviewText={dinerActions.reviewText}
        onReviewTextChange={dinerActions.setReviewText}
        reviewPhotos={dinerActions.reviewPhotos}
        onPhotoUpload={dinerActions.handlePhotoUpload}
        onPhotoRemove={dinerActions.handleRemovePhoto}
        isSubmitting={dinerActions.isSubmitting}
        uploadingPhotos={dinerActions.uploadingPhotos}
        restaurantName={restaurant.name}
      />
    </>
  );
}
