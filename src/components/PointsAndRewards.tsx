"use client";

import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Gift, Star, Award, Zap, Crown } from "lucide-react";
import {
  useWinnerNotifications,
  formatCompetitionPeriod,
} from "@/hooks/use-winner-notifications";

interface PointsAndRewardsProps {
  totalPoints: number;
}

export default function PointsAndRewards({
  totalPoints,
}: PointsAndRewardsProps) {
  const { user } = useAuth0();
  const { history } = useWinnerNotifications(user?.email || null);
  
  // Calculate statistics
  const totalCompetitionsWon = history?.length || 0;
  const totalLifetimePoints = history?.reduce((sum, win) => sum + win.total_points, 0) || 0;
  const averagePointsPerWin = totalCompetitionsWon > 0 ? Math.round(totalLifetimePoints / totalCompetitionsWon) : 0;
  
  return (
    <div className="space-y-6">
      {/* Comprehensive Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Week Points</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {totalPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Competitions Won</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalCompetitionsWon}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Lifetime Competition Points</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalLifetimePoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {totalCompetitionsWon > 0 ? "Avg Points Per Win" : "Status"}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalCompetitionsWon > 0 ? averagePointsPerWin : "Active"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Winner History Section */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Competition Wins
            </CardTitle>
            <CardDescription>Your weekly competition victories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((win, index) => (
                <div
                  key={win.period_id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {index === 0
                          ? "Latest Win"
                          : `Win #${history.length - index}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCompetitionPeriod(
                          win.competition_start_date,
                          win.competition_end_date
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">
                      {win.total_points} points
                    </p>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      Winner
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Points Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            How to Earn Points
          </CardTitle>
          <CardDescription>
            Ways to accumulate points through dining activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Visit a restaurant</p>
                  <p className="text-sm text-gray-600">+10 points</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Write a review</p>
                  <p className="text-sm text-gray-600">+25-50 points</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Add photos to review</p>
                  <p className="text-sm text-gray-600">+5 points each</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Weekly competition</p>
                  <p className="text-sm text-gray-600">
                    Fresh start every Monday!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>Exciting features we're working on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Award className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600">Achievement Badges</p>
                <p className="text-sm text-gray-500">
                  Unlock dining milestones
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">
                Soon
              </Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Gift className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600">Rewards Program</p>
                <p className="text-sm text-gray-500">
                  Redeem points for discounts
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">
                Soon
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
