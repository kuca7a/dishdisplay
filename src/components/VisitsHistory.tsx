"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  Edit,
  ExternalLink,
  Trophy,
} from "lucide-react";
import { DinerVisit } from "@/types/database";

interface VisitsHistoryProps {
  visits: DinerVisit[];
  onWriteReview: (visitId: string) => void;
}

export default function VisitsHistory({
  visits,
  onWriteReview,
}: VisitsHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeSpent = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
          <CardDescription>
            Your restaurant visits will appear here once you scan QR codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No visits yet</p>
            <p>
              Scan a QR code at a restaurant to start tracking your dining
              journey!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit History</CardTitle>
        <CardDescription>
          Your verified restaurant visits and dining activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visits.map((visit) => (
            <div key={visit.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={visit.restaurants?.logo_url} />
                    <AvatarFallback>
                      {visit.restaurants?.name?.charAt(0) || "R"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-lg">
                        {visit.restaurants?.name || "Restaurant"}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />+
                        {visit.points_earned} pts
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(visit.visit_date)}
                      </div>

                      {visit.time_spent_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeSpent(visit.time_spent_minutes)}
                        </div>
                      )}
                    </div>

                    {visit.restaurants?.address && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4" />
                        {visit.restaurants.address}
                        {visit.restaurants.city &&
                          `, ${visit.restaurants.city}`}
                      </div>
                    )}

                    {visit.dishes_viewed && visit.dishes_viewed.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Menu items viewed:</span>{" "}
                        {visit.dishes_viewed.length}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onWriteReview(visit.id)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Write Review
                  </Button>

                  {visit.restaurants?.id && (
                    <Button size="sm" variant="ghost" asChild className="gap-2">
                      <a
                        href={`/menu/${visit.restaurants.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Menu
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {/* Review status indicator */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {visit.review_id ? (
                      <>
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-green-600 font-medium">
                          Review submitted
                        </span>
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 text-gray-300" />
                        <span className="text-gray-500">No review yet</span>
                      </>
                    )}
                  </div>

                  <div className="text-gray-500">
                    Visit #{visits.indexOf(visit) + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visits.length >= 10 && (
          <div className="mt-6 text-center">
            <Button variant="outline">Load More Visits</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
