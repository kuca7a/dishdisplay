"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import PointsAndRewards from "@/components/PointsAndRewards";
import { Card, CardContent } from "@/components/ui/card";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";

interface DinerProfile {
  total_points: number;
  total_visits: number;
  total_reviews: number;
}

export default function PointsRewardsContent() {
  const { user, isAuthenticated } = useAuth0();
  const [profile, setProfile] = useState<DinerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated || !user?.email) return;

      try {
        const response = await fetch(`/api/diner/profile?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch diner profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, user?.email]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <ThreeDotsLoader size="md" />
          <span className="mt-2 text-gray-600">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please log in to view your points and rewards.</p>
        </CardContent>
      </Card>
    );
  }

  return <PointsAndRewards totalPoints={profile?.total_points || 0} />;
}