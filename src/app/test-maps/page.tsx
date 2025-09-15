"use client";

import { useEffect, useRef } from 'react';

export default function GoogleMapsTest() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('=== Google Maps Debug ===');
    console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('❌ No API key found!');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Google Maps script loaded');
      
      if (mapRef.current && (window as any).google) {
        console.log('✅ Creating map...');
        
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: { lat: 51.505, lng: -0.09 },
          zoom: 13,
        });
        
        // Add a test marker
        new (window as any).google.maps.Marker({
          position: { lat: 51.505, lng: -0.09 },
          map: map,
          title: 'Test Marker'
        });
        
        console.log('✅ Map created successfully!');
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps:', error);
    };
    
    document.head.appendChild(script);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Google Maps Test</h1>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '400px' }}
        className="border border-gray-300 rounded-lg"
      />
      <div className="mt-4 text-sm text-gray-600">
        <p>Check browser console for debug information.</p>
        <p>API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Found' : 'Missing'}</p>
      </div>
    </div>
  );
}