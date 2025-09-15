"use client";

// Type definition for Google Maps on window
interface GoogleMapsWindow extends Window {
  google?: {
    maps?: unknown;
  };
}

// Google Maps loader service - ensures API is loaded only once
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private isLoaded = false;
  private isLoading = false;
  private callbacks: (() => void)[] = [];

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public load(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (this.isLoaded && (window as GoogleMapsWindow).google) {
        resolve();
        return;
      }

      // Add callback to queue
      this.callbacks.push(resolve);

      // If already loading, just wait
      if (this.isLoading) {
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        this.isLoading = true;
        existingScript.addEventListener('load', this.onScriptLoad.bind(this));
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
        return;
      }

      // Load the script
      this.isLoading = true;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-api-script';

      script.onload = this.onScriptLoad.bind(this);
      script.onerror = () => {
        this.isLoading = false;
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });
  }

  private onScriptLoad() {
    this.isLoaded = true;
    this.isLoading = false;
    
    // Execute all callbacks
    this.callbacks.forEach(callback => callback());
    this.callbacks = [];
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!(window as GoogleMapsWindow).google?.maps;
  }
}

export default GoogleMapsLoader;