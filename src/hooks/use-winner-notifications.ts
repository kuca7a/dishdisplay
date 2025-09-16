import { useEffect, useState } from "react";
import { toast } from "sonner";

interface WinnerNotification {
  period_id: string;
  total_points: number;
  competition_start_date: string;
  competition_end_date: string;
  created_at: string;
}

interface WinnerHistory {
  period_id: string;
  total_points: number;
  competition_start_date: string;
  competition_end_date: string;
  won_at: string;
}

interface UseWinnerNotificationsResult {
  notifications: WinnerNotification[];
  history: WinnerHistory[];
  loading: boolean;
  markNotificationSeen: (periodId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useWinnerNotifications(
  userEmail: string | null
): UseWinnerNotificationsResult {
  const [notifications, setNotifications] = useState<WinnerNotification[]>([]);
  const [history, setHistory] = useState<WinnerHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/winner-notifications?email=${encodeURIComponent(
          userEmail
        )}&type=all`
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
        setHistory(data.history || []);
      } else {
        console.error("Failed to fetch winner notifications:", data.error);
      }
    } catch (error) {
      console.error("Error fetching winner notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationSeen = async (periodId: string) => {
    if (!userEmail) return;

    try {
      const response = await fetch("/api/winner-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          period_id: periodId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove the notification from unseen list
        setNotifications((prev) =>
          prev.filter((n) => n.period_id !== periodId)
        );
      } else {
        console.error("Failed to mark notification as seen:", data.error);
      }
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const showWinnerToast = (notification: WinnerNotification) => {
    const startDate = new Date(
      notification.competition_start_date
    ).toLocaleDateString();
    const endDate = new Date(
      notification.competition_end_date
    ).toLocaleDateString();

    toast.success(`🏆 Congratulations! You won the weekly competition!`, {
      description: `You earned ${notification.total_points} points during ${startDate} - ${endDate}`,
      duration: 8000,
      action: {
        label: "View Details",
        onClick: () => {
          // Navigate to points & rewards page
          window.location.href = "/diner?section=points";
        },
      },
    });

    // Mark as seen after showing toast
    markNotificationSeen(notification.period_id);
  };

  // Show toasts for unseen notifications
  useEffect(() => {
    if (!loading && notifications.length > 0) {
      notifications.forEach((notification) => {
        showWinnerToast(notification);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, notifications.length]);

  // Initial fetch
  useEffect(() => {
    if (userEmail) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  return {
    notifications,
    history,
    loading,
    markNotificationSeen,
    refreshNotifications: fetchNotifications,
  };
}

// Utility function to format competition dates
export function formatCompetitionPeriod(
  startDate: string,
  endDate: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year:
      start.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  };

  const startStr = start.toLocaleDateString("en-US", options);
  const endStr = end.toLocaleDateString("en-US", options);

  return `${startStr} - ${endStr}`;
}
