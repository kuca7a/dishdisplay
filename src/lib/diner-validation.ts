// Anti-spam and validation service for diner interactions

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // in hours
  canRetry?: boolean;
}

export interface PointsCalculation {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  bonuses: string[];
}

export class DinerValidationService {
  /**
   * Check if a visit is allowed (anti-spam protection)
   */
  static checkVisitRateLimit(lastVisitDate: string | null): RateLimitResult {
    if (!lastVisitDate) {
      return { allowed: true };
    }

    const lastVisit = new Date(lastVisitDate);
    const timeDiff = Date.now() - lastVisit.getTime();
    const hoursElapsed = timeDiff / (60 * 60 * 1000);

    if (hoursElapsed < 24) {
      const hoursRemaining = Math.ceil(24 - hoursElapsed);
      return {
        allowed: false,
        reason: `You can only log one visit per restaurant every 24 hours. Try again in ${hoursRemaining} hour${
          hoursRemaining !== 1 ? "s" : ""
        }.`,
        retryAfter: hoursRemaining,
        canRetry: true,
      };
    }

    return { allowed: true };
  }

  /**
   * Check if a review is allowed (multiple validations)
   */
  static checkReviewRateLimit(
    lastReviewDate: string | null,
    todayReviewCount: number,
    lastVisitDate: string | null
  ): RateLimitResult {
    // 1. Check for review within 7 days
    if (lastReviewDate) {
      const lastReview = new Date(lastReviewDate);
      const timeDiff = Date.now() - lastReview.getTime();
      const daysElapsed = timeDiff / (24 * 60 * 60 * 1000);

      if (daysElapsed < 7) {
        const daysRemaining = Math.ceil(7 - daysElapsed);
        return {
          allowed: false,
          reason: `You can only submit one review per restaurant every 7 days. Try again in ${daysRemaining} day${
            daysRemaining !== 1 ? "s" : ""
          }.`,
          retryAfter: daysRemaining * 24,
          canRetry: true,
        };
      }
    }

    // 2. Check daily review limit (max 3 per day)
    if (todayReviewCount >= 3) {
      return {
        allowed: false,
        reason:
          "You can only submit up to 3 reviews per day. This helps maintain review quality and prevents spam.",
        canRetry: true,
      };
    }

    // 3. Check for recent visit requirement
    if (!lastVisitDate) {
      return {
        allowed: false,
        reason:
          "You need to have visited this restaurant within the last 30 days to leave a review. Please log a visit first!",
        canRetry: false,
      };
    }

    const lastVisit = new Date(lastVisitDate);
    const timeDiff = Date.now() - lastVisit.getTime();
    const daysElapsed = timeDiff / (24 * 60 * 60 * 1000);

    if (daysElapsed > 30) {
      return {
        allowed: false,
        reason:
          "You need to have visited this restaurant within the last 30 days to leave a review. Please log a visit first!",
        canRetry: false,
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate points for a review with quality bonuses
   */
  static calculateReviewPoints(
    reviewText: string,
    photos: string[]
  ): PointsCalculation {
    const basePoints = 25;
    let bonusPoints = 0;
    const bonuses: string[] = [];

    // Bonus for detailed review (minimum 20 characters)
    if (reviewText && reviewText.trim().length >= 20) {
      bonusPoints += 10;
      bonuses.push("+10 for detailed review");
    }

    // Bonus for photos
    if (photos && photos.length > 0) {
      const photoBonus = Math.min(photos.length * 5, 15); // Max 15 bonus for photos
      bonusPoints += photoBonus;
      bonuses.push(
        `+${photoBonus} for ${photos.length} photo${
          photos.length !== 1 ? "s" : ""
        }`
      );
    }

    // Cap total points at 50
    const totalPoints = Math.min(basePoints + bonusPoints, 50);

    return {
      basePoints,
      bonusPoints,
      totalPoints,
      bonuses,
    };
  }

  /**
   * Calculate visit points (simple for now, could add streak bonuses later)
   */
  static calculateVisitPoints(): PointsCalculation {
    return {
      basePoints: 10,
      bonusPoints: 0,
      totalPoints: 10,
      bonuses: [],
    };
  }

  /**
   * Validate review content quality
   */
  static validateReviewContent(
    rating: number,
    reviewText: string
  ): { valid: boolean; reason?: string } {
    if (rating < 1 || rating > 5) {
      return { valid: false, reason: "Rating must be between 1 and 5 stars" };
    }

    // Allow empty reviews for now, but could add minimum length requirement
    if (reviewText && reviewText.length > 1000) {
      return {
        valid: false,
        reason: "Review text cannot exceed 1000 characters",
      };
    }

    return { valid: true };
  }
}
