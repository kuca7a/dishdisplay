"use client";

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export type UserType = 'restaurant_owner' | 'diner' | null;

export function useUserType(): {
  userType: UserType;
  loading: boolean;
  error: string | null;
} {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user?.email) {
      setUserType(null);
      return;
    }

    async function detectUserType() {
      setLoading(true);
      setError(null);

      try {
        // First check if user has a restaurant (restaurant owner)
        const restaurantResponse = await fetch(`/api/restaurants/by-owner?email=${encodeURIComponent(user!.email!)}`);
        
        if (restaurantResponse.ok) {
          const restaurantData = await restaurantResponse.json();
          if (restaurantData && restaurantData.id) {
            setUserType('restaurant_owner');
            setLoading(false);
            return;
          }
        }

        // Then check if user has a diner profile (diner)
        const dinerResponse = await fetch(`/api/diner/profile?email=${encodeURIComponent(user!.email!)}`);
        
        if (dinerResponse.ok) {
          const dinerData = await dinerResponse.json();
          if (dinerData && dinerData.id) {
            setUserType('diner');
            setLoading(false);
            return;
          }
        }

        // If neither, user type is unknown (new user)
        setUserType(null);
      } catch (err) {
        console.error('Error detecting user type:', err);
        setError('Failed to determine user type');
        setUserType(null);
      } finally {
        setLoading(false);
      }
    }

    detectUserType();
  }, [user, isAuthenticated, isLoading]);

  return { userType, loading, error };
}
