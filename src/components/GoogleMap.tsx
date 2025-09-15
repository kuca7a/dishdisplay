"use client";

import React, { useEffect, useRef, useCallback } from 'react';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  business_type: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  primary_color: string | null;
  full_address: string;
  menu_url: string;
  is_open: boolean;
  maps_url: string;
  monday_hours: string | null;
  tuesday_hours: string | null;
  wednesday_hours: string | null;
  thursday_hours: string | null;
  friday_hours: string | null;
  saturday_hours: string | null;
  sunday_hours: string | null;
  timezone: string | null;
  menu_preview: {
    name: string;
    price: number;
    category: string;
  }[];
}

interface GoogleMapProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  height?: string;
  zoom?: number;
}

// Google Maps types
interface GoogleMapsWindow extends Window {
  google: {
    maps: {
      Map: new (element: HTMLElement, options: any) => any;
      Marker: new (options: any) => any;
      InfoWindow: new (options: any) => any;
      LatLng: new (lat: number, lng: number) => any;
      LatLngBounds: new () => any;
      SymbolPath: {
        CIRCLE: any;
      };
    };
  };
  initMap: () => void;
}

declare let window: GoogleMapsWindow;

export default function GoogleMap({ 
  restaurants, 
  selectedRestaurant, 
  onRestaurantSelect,
  height = "400px",
  zoom = 12
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    // Default center (will be updated with restaurant locations)
    const center = restaurants.length > 0 
      ? { lat: restaurants[0].latitude, lng: restaurants[0].longitude }
      : { lat: 51.505, lng: -0.09 }; // London default

    // Create map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      zoom: zoom,
      center: center,
      styles: [
        {
          "featureType": "poi.business",
          "stylers": [{ "visibility": "off" }]
        }
      ]
    });

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each restaurant
    restaurants.forEach((restaurant) => {
      const isSelected = selectedRestaurant?.id === restaurant.id;
      
      const marker = new window.google.maps.Marker({
        position: { 
          lat: restaurant.latitude, 
          lng: restaurant.longitude 
        },
        map: mapInstance.current,
        title: restaurant.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 12 : 8,
          fillColor: isSelected ? '#3B82F6' : '#5F7161',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 2,
        },
        zIndex: isSelected ? 1000 : 1
      });

      // Create two info windows - one for hover, one for click
      const hoverInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 16px; min-width: 280px; max-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 12px;">
              <h3 style="margin: 0; font-size: 17px; font-weight: 600; color: #1f2937; flex: 1; line-height: 1.3;">${restaurant.name}</h3>
              ${restaurant.is_open ? `
                <span style="display: inline-flex; align-items: center; padding: 3px 7px; border-radius: 4px; font-size: 11px; font-weight: 500; background-color: #dcfce7; color: #166534; flex-shrink: 0;">
                  <div style="width: 6px; height: 6px; background-color: #16a34a; border-radius: 50%; margin-right: 4px;"></div>
                  Open
                </span>
              ` : ''}
            </div>
            
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px; color: #6b7280; font-size: 13px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span style="line-height: 1.3;">${restaurant.full_address}</span>
            </div>
            
            ${restaurant.business_type ? `
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; background-color: #f3f4f6; color: #374151;">
                  ${restaurant.business_type}
                </span>
              </div>
            ` : ''}
            
            ${restaurant.menu_preview && restaurant.menu_preview.length > 0 ? `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">Popular Items:</div>
                <div style="space-y: 4px;">
                  ${restaurant.menu_preview.slice(0, 3).map(item => `
                    <div style="display: flex; justify-content: between; align-items: start; padding: 4px 0; border-bottom: 1px solid #f3f4f6;">
                      <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 500; color: #1f2937; line-height: 1.2;">${item.name}</div>
                        <div style="font-size: 11px; color: #6b7280; text-transform: capitalize;">${item.category}</div>
                      </div>
                      <div style="font-size: 13px; font-weight: 600; color: #059669; margin-left: 8px;">$${item.price}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div style="display: flex; align-items: center; gap: 16px; font-size: 13px; padding-top: 4px;">
              <a href="${restaurant.menu_url}" style="color: #5F7161; text-decoration: none; font-weight: 600; transition: color 0.2s;">
                View Full Menu →
              </a>
              <a href="${restaurant.maps_url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                Directions
              </a>
            </div>
          </div>
        `
      });

      const clickInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${restaurant.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${restaurant.full_address}</p>
            <a href="${restaurant.menu_url}" target="_blank" style="color: #5F7161; text-decoration: none; font-size: 14px;">View Menu →</a>
          </div>
        `
      });

      // Hover events
      marker.addListener('mouseover', () => {
        // Close any open click info windows first
        markersRef.current.forEach((m: any) => {
          if (m.clickInfoWindow) m.clickInfoWindow.close();
        });
        hoverInfoWindow.open(mapInstance.current, marker);
      });

      marker.addListener('mouseout', () => {
        hoverInfoWindow.close();
      });

      // Click events
      marker.addListener('click', () => {
        // Close all hover info windows
        markersRef.current.forEach((m: any) => {
          if (m.hoverInfoWindow) m.hoverInfoWindow.close();
        });
        
        // Close all other click info windows
        markersRef.current.forEach((m: any) => {
          if (m.clickInfoWindow && m !== marker) m.clickInfoWindow.close();
        });
        
        // Open this click info window
        clickInfoWindow.open(mapInstance.current, marker);
        
        // Call selection callback
        if (onRestaurantSelect) {
          onRestaurantSelect(restaurant);
        }
      });

      // Store references to info windows
      (marker as any).hoverInfoWindow = hoverInfoWindow;
      (marker as any).clickInfoWindow = clickInfoWindow;
      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (restaurants.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      restaurants.forEach(restaurant => {
        bounds.extend(new window.google.maps.LatLng(restaurant.latitude, restaurant.longitude));
      });
      mapInstance.current.fitBounds(bounds);
    }
  }, [restaurants, zoom, onRestaurantSelect, selectedRestaurant?.id]);

  useEffect(() => {
    console.log('GoogleMap component mounted');
    console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    console.log('Restaurants:', restaurants.length);
    
    const loadGoogleMaps = async () => {
      // Check if Google Maps is already loaded
      if ((window as any).google?.maps) {
        console.log('Google Maps already loaded, initializing map...');
        initializeMap();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('#google-maps-script');
      if (existingScript) {
        console.log('Google Maps script already exists, waiting...');
        // Wait for existing script to finish loading
        const checkLoaded = setInterval(() => {
          if ((window as any).google?.maps) {
            clearInterval(checkLoaded);
            initializeMap();
          }
        }, 100);
        return;
      }

      // Load Google Maps script
      console.log('Loading Google Maps script...');
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        initializeMap();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup markers and info windows
      markersRef.current.forEach(marker => {
        if ((marker as any).hoverInfoWindow) (marker as any).hoverInfoWindow.close();
        if ((marker as any).clickInfoWindow) (marker as any).clickInfoWindow.close();
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [initializeMap, restaurants.length]);

  useEffect(() => {
    // Update selected restaurant marker - just center, don't zoom too much
    if (mapInstance.current && selectedRestaurant) {
      const center = new window.google.maps.LatLng(
        selectedRestaurant.latitude,
        selectedRestaurant.longitude
      );
      mapInstance.current.setCenter(center);
      // Only zoom in if current zoom is less than 12
      const currentZoom = mapInstance.current.getZoom();
      if (currentZoom < 12) {
        mapInstance.current.setZoom(12);
      }
      
      // Re-render markers to update selection styling
      initializeMap();
    }
  }, [selectedRestaurant, initializeMap]);

  return (
    <div 
      ref={mapRef} 
      style={{ width: '100%', height }}
      className="w-full h-full"
    />
  );
}