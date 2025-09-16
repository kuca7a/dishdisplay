"use client";

import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Users, Calendar, Star } from "lucide-react";
import { LeaderboardData } from "@/types/database";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import { useWinnerNotifications } from "@/hooks/use-winner-notifications";

export default function LeaderboardContent() {
  const { user, isAuthenticated } = useAuth0();
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize winner notifications (will show toasts automatically)
  useWinnerNotifications(isAuthenticated ? user?.email || null : null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use direct API instead of service layer
        const url = `/api/leaderboard${
          isAuthenticated && user?.email
            ? `?email=${encodeURIComponent(user.email)}`
            : ""
        }`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.leaderboard) {
          setLeaderboardData(result.leaderboard);
        } else {
          setError(result.error || "Could not load leaderboard data");
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [isAuthenticated, user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatPeriodDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", options)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ThreeDotsLoader size="md" />
          <p className="text-lg text-gray-600 mt-4">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error || !leaderboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Leaderboard Unavailable
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {error || "Could not load the leaderboard at this time."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { current_period, top_entries, current_user_entry, prize_restaurant } =
    leaderboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Weekly Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatPeriodDates(
              current_period.start_date,
              current_period.end_date
            )}
          </p>
        </div>

        {/* Prize Information */}
        {prize_restaurant && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h3 className="font-semibold text-yellow-800">
                  This Week's Prize
                </h3>
                <p className="text-sm text-yellow-700">
                  Current leader gets a free meal at{" "}
                  <strong>{prize_restaurant.name}</strong>
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Most reviewed restaurant this week
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current User's Position (if not in top 10) */}
        {current_user_entry && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">
                  Your Current Position
                </h3>
                <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                  <Badge className={getRankBadgeColor(current_user_entry.rank)}>
                    Rank #{current_user_entry.rank}
                  </Badge>
                  <span className="font-bold text-blue-900 text-sm sm:text-base">
                    {current_user_entry.total_points} points
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 10 Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 10 This Week
            </CardTitle>
            <CardDescription>
              Earn points by logging visits (+10) and writing reviews (+25)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {top_entries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">
                  No competitors yet
                </h3>
                <p className="text-gray-500">
                  Be the first to start earning points!
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {top_entries.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border ${
                      entry.is_current_user
                        ? "border-blue-200 bg-blue-50"
                        : entry.is_winner
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        {getRankIcon(entry.rank)}
                      </div>

                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                        <AvatarImage src={entry.profile_photo_url} />
                        <AvatarFallback className="bg-gray-200 text-xs sm:text-sm">
                          {entry.diner_name.charAt(0).toUpperCase()}
                          {entry.surname_initial || ""}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap mb-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate mr-1">
                            {entry.diner_name}
                            {entry.surname_initial &&
                              ` ${entry.surname_initial}.`}
                          </p>
                          {entry.is_current_user && (
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              You
                            </Badge>
                          )}
                          {entry.is_winner && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-800 whitespace-nowrap">
                              Current Leader 🎉
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Rank #{entry.rank}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {entry.total_points}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">points</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-green-800 text-base sm:text-lg">
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  +10
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    Log a Visit
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    Use visit tokens from restaurants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  +25
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    Write a Review
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    Share your dining experience
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  +15
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    Add Photos to Review
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    Upload photos with your review
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  +15
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    3+ Day Visit Streak
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    Visit restaurants on consecutive days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  +25
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    Complete Your Profile
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    Add photo, bio, preferences & location
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  +10
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-green-800 text-sm sm:text-base">
                    Detailed Review Bonus
                  </p>
                  <p className="text-xs sm:text-sm text-green-600">
                    Write 50+ characters for extra points
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
