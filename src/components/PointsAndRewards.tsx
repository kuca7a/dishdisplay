"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  Gift, 
  Star,
  Award,
  Zap,
  Users
} from "lucide-react";

interface PointsAndRewardsProps {
  totalPoints: number;
  dinerEmail: string;
}

export default function PointsAndRewards({ 
  totalPoints,
  dinerEmail
}: PointsAndRewardsProps) {
  
  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Star className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-bold text-blue-600">Active Diner</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <p className="text-sm text-gray-600">+50 points</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Write a review</p>
                  <p className="text-sm text-gray-600">+100 points</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Upload photos</p>
                  <p className="text-sm text-gray-600">+25 points each</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Refer a friend</p>
                  <p className="text-sm text-gray-600">+200 points</p>
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
          <CardDescription>
            Exciting features we're working on
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Trophy className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600">Leaderboards</p>
                <p className="text-sm text-gray-500">Compete with other diners</p>
              </div>
              <Badge variant="outline" className="ml-auto">Soon</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Award className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600">Achievement Badges</p>
                <p className="text-sm text-gray-500">Unlock dining milestones</p>
              </div>
              <Badge variant="outline" className="ml-auto">Soon</Badge>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Gift className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-600">Rewards Program</p>
                <p className="text-sm text-gray-500">Redeem points for discounts</p>
              </div>
              <Badge variant="outline" className="ml-auto">Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
