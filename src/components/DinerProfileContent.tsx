"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { Rubik } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DinerSidebar } from "@/components/diner-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Trophy,
  MapPin,
  Star,
  Calendar,
  Camera,
  Settings,
  Medal,
  Crown,
  Heart,
  Eye,
  EyeOff,
} from "lucide-react";
import { ThreeDotsLoader } from "@/components/ui/three-dots-loader";
import {
  DinerProfile,
  DinerVisit,
  DinerReview,
  DinerBadge,
} from "@/types/database";
import VisitsHistory from "@/components/VisitsHistory";
import ReviewForm from "@/components/ReviewForm";
import PointsAndRewards from "@/components/PointsAndRewards";

const rubik = Rubik({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export default function DinerProfileContent() {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<DinerProfile | null>(null);
  const [visits, setVisits] = useState<DinerVisit[]>([]);
  const [reviews, setReviews] = useState<DinerReview[]>([]);
  const [badges, setBadges] = useState<DinerBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    is_public: true,
  });

  // Modal states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedVisitForReview, setSelectedVisitForReview] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  const loadDinerData = useCallback(async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);

      // Load profile data
      const [profileResponse, visitsResponse, reviewsResponse, badgesResponse] =
        await Promise.all([
          fetch(`/api/diner/profile?email=${encodeURIComponent(user.email)}`),
          fetch(`/api/diner/visits?email=${encodeURIComponent(user.email)}`),
          fetch(`/api/diner/reviews?email=${encodeURIComponent(user.email)}`),
          fetch(`/api/diner/badges?email=${encodeURIComponent(user.email)}`),
        ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
        setFormData({
          display_name: profileData.display_name || "",
          is_public: profileData.is_public ?? true,
        });
      }

      if (visitsResponse.ok) {
        const visitsData = await visitsResponse.json();
        setVisits(visitsData);
      }

      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      }

      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }
    } catch (err) {
      console.error("Error loading diner data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadDinerData();
    }
  }, [isAuthenticated, user, loadDinerData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    try {
      setSaving(true);
      const response = await fetch("/api/diner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (reviewData: {
    rating: number;
    content?: string;
    photo_urls?: string[];
    is_public?: boolean;
  }) => {
    try {
      const response = await fetch("/api/diner/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reviewData,
          visit_id: selectedVisitForReview,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      // Refresh data
      await loadDinerData();
      setShowReviewForm(false);
      setSelectedVisitForReview(null);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review");
    }
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ThreeDotsLoader size="lg" color="#5F7161" />
      </div>
    );
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={rubik.className}>
          <div className="flex items-center justify-center min-h-screen">
            <ThreeDotsLoader size="lg" color="#5F7161" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <DinerSidebar />
      <SidebarInset className={rubik.className}>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/profile">Profile</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Diner Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <User className="h-8 w-8 text-[#5F7161]" />
                <h1 className="text-3xl font-bold">My Diner Profile</h1>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Track your restaurant visits, manage reviews, and earn rewards
              </p>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.profile_photo_url} />
                      <AvatarFallback className="text-lg">
                        {profile?.display_name?.charAt(0) ||
                          user?.name?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl">
                        {profile?.display_name || user?.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Member since{" "}
                        {profile ? formatJoinDate(profile.join_date) : "today"}
                      </CardDescription>
                      <div className="flex items-center gap-1 mt-2">
                        {profile?.is_public ? (
                          <>
                            <Eye className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              Public Profile
                            </span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-500">
                              Private Profile
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(!editMode)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {editMode ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>

              {editMode && (
                <CardContent>
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-4 max-w-md"
                  >
                    <div>
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            display_name: e.target.value,
                          }))
                        }
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_public"
                        checked={formData.is_public}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_public: checked,
                          }))
                        }
                      />
                      <Label htmlFor="is_public">Make profile public</Label>
                    </div>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-[#5F7161] hover:bg-[#4C5B4F]"
                    >
                      {saving ? (
                        <>
                          <ThreeDotsLoader size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              )}
            </Card>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {profile?.total_visits || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Visits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {profile?.total_points || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{reviews.length}</p>
                      <p className="text-sm text-gray-600">Reviews Written</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Medal className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{badges.length}</p>
                      <p className="text-sm text-gray-600">Badges Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="visits" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visits">Visit History</TabsTrigger>
                <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                <TabsTrigger value="rewards">Points & Rewards</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
              </TabsList>

              <TabsContent value="visits" className="space-y-4">
                <VisitsHistory
                  visits={visits}
                  onWriteReview={(visitId: string) => {
                    setSelectedVisitForReview(visitId);
                    setShowReviewForm(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Reviews</CardTitle>
                    <CardDescription>
                      Reviews you've written for restaurants you've visited
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No reviews yet</p>
                        <p>Visit a restaurant and leave your first review!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">
                                  {review.title || "Review"}
                                </h4>
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-sm text-gray-600 ml-2">
                                    {new Date(
                                      review.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                variant={
                                  review.is_public ? "default" : "secondary"
                                }
                              >
                                {review.is_public ? "Public" : "Private"}
                              </Badge>
                            </div>
                            {review.content && (
                              <p className="text-gray-700 mt-2">
                                {review.content}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                              <span>+{review.points_earned} points earned</span>
                              {review.photo_urls &&
                                review.photo_urls.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Camera className="h-4 w-4" />
                                    <span>
                                      {review.photo_urls.length} photos
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards">
                <PointsAndRewards totalPoints={profile?.total_points || 0} />
              </TabsContent>

              <TabsContent value="badges" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>
                      Badges you've earned for your dining activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {badges.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Medal className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No badges yet</p>
                        <p>
                          Keep visiting restaurants and writing reviews to earn
                          badges!
                        </p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="border rounded-lg p-4 text-center"
                          >
                            <div className="flex justify-center mb-3">
                              {badge.badge_type === "champion" && (
                                <Crown className="h-8 w-8 text-yellow-500" />
                              )}
                              {badge.badge_type === "reviewer" && (
                                <Star className="h-8 w-8 text-blue-500" />
                              )}
                              {badge.badge_type === "photographer" && (
                                <Camera className="h-8 w-8 text-green-500" />
                              )}
                              {badge.badge_type === "frequent_visitor" && (
                                <Heart className="h-8 w-8 text-red-500" />
                              )}
                              {badge.badge_type === "explorer" && (
                                <MapPin className="h-8 w-8 text-purple-500" />
                              )}
                              {badge.badge_type === "first_visit" && (
                                <Trophy className="h-8 w-8 text-orange-500" />
                              )}
                            </div>
                            <h4 className="font-medium">{badge.badge_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {badge.badge_description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Earned{" "}
                              {new Date(badge.earned_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && selectedVisitForReview && (
          <ReviewForm
            visitId={selectedVisitForReview}
            onSubmit={handleReviewSubmit}
            onClose={() => {
              setShowReviewForm(false);
              setSelectedVisitForReview(null);
            }}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
