"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Flame, 
  CheckCircle, 
  AlertCircle, 
  User, 
  FileText, 
  Utensils, 
  MapPin 
} from "lucide-react";

interface ProfileCompletionProps {
  userEmail?: string;
}

interface CompletionData {
  completionPercentage: number;
  bonusAwarded: boolean;
  bonusPoints: number;
  missingFields: string[];
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate?: string;
}

export default function ProfileCompletionCard({ userEmail }: ProfileCompletionProps) {
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile completion data
        const completionResponse = await fetch(`/api/diner/profile-completion?email=${userEmail}`);
        if (completionResponse.ok) {
          const completionResult = await completionResponse.json();
          setCompletionData(completionResult);
        }

        // Fetch streak data
        const streakResponse = await fetch(`/api/diner/streak?email=${userEmail}`);
        if (streakResponse.ok) {
          const streakResult = await streakResponse.json();
          setStreakData(streakResult);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchProfileData();
    }
  }, [userEmail]);

  if (!userEmail) return null;

  return (
    <div className="space-y-4">
      {/* Visit Streak Card */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Flame className="h-5 w-5" />
            Visit Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading streak data...</p>
          ) : streakData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {streakData.currentStreak}
                  </p>
                  <p className="text-sm text-orange-600">
                    {streakData.currentStreak === 1 ? 'day' : 'days'} in a row
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-orange-800">Best Streak</p>
                  <p className="text-lg font-bold text-orange-600">
                    {streakData.longestStreak}
                  </p>
                </div>
              </div>
              
              {streakData.currentStreak >= 3 && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                  🔥 Earning +15 bonus points per visit!
                </Badge>
              )}
              
              {streakData.currentStreak < 3 && (
                <p className="text-xs text-orange-600">
                  Visit on {3 - streakData.currentStreak} more consecutive days to unlock streak bonuses!
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-orange-600">Start your streak by visiting a restaurant!</p>
          )}
        </CardContent>
      </Card>

      {/* Profile Completion Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription className="text-blue-600">
            Complete your profile to earn bonus points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Loading completion data...</p>
          ) : completionData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {completionData.completionPercentage}%
                  </p>
                  <p className="text-sm text-blue-600">Complete</p>
                </div>
                {completionData.bonusAwarded ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    +25 Points Earned!
                  </Badge>
                ) : completionData.completionPercentage === 100 ? (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    Ready for Bonus!
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    +25 Points Waiting
                  </Badge>
                )}
              </div>

              <Progress value={completionData.completionPercentage} className="h-2" />

              {completionData.missingFields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-800">Missing:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {completionData.missingFields.map((field) => (
                      <div key={field} className="flex items-center gap-2 text-xs text-blue-600">
                        {field === 'Profile Photo' && <User className="h-3 w-3" />}
                        {field === 'Bio (10+ characters)' && <FileText className="h-3 w-3" />}
                        {field === 'Dietary Preferences' && <Utensils className="h-3 w-3" />}
                        {field === 'Location' && <MapPin className="h-3 w-3" />}
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completionData.completionPercentage === 100 && !completionData.bonusAwarded && (
                <Button 
                  onClick={() => window.location.href = '/diner/profile'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Claim Your +25 Points!
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-blue-600">Complete your profile to see progress!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
