"use client";

import { useEffect } from "react";

interface PerformanceMetrics {
  pageLoadTime?: number;
  domContentLoaded?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

export function usePerformanceMonitoring(
  pageName: string,
  enabled: boolean = process.env.NODE_ENV === "production"
) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      const metrics: PerformanceMetrics = {};

      // Collect timing metrics
      const navigationEntries = performance.getEntriesByType(
        "navigation"
      ) as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        metrics.pageLoadTime = nav.loadEventEnd - nav.fetchStart;
        metrics.domContentLoaded =
          nav.domContentLoadedEventEnd - nav.fetchStart;
      }

      // Collect paint metrics
      for (const entry of list.getEntries()) {
        switch (entry.name) {
          case "first-contentful-paint":
            metrics.firstContentfulPaint = entry.startTime;
            break;
          case "largest-contentful-paint":
            metrics.largestContentfulPaint = entry.startTime;
            break;
        }

        // Collect layout shift metrics
        if (
          entry.entryType === "layout-shift" &&
          !(entry as PerformanceEntry & { hadRecentInput?: boolean })
            .hadRecentInput
        ) {
          metrics.cumulativeLayoutShift =
            (metrics.cumulativeLayoutShift || 0) +
            (entry as PerformanceEntry & { value: number }).value;
        }

        // Collect first input delay
        if (entry.entryType === "first-input") {
          metrics.firstInputDelay =
            (entry as PerformanceEntry & { processingStart: number })
              .processingStart - entry.startTime;
        }
      }

      // Send metrics to analytics (in production, you'd send to your analytics service)
      if (Object.keys(metrics).length > 0) {
        console.log(`Performance metrics for ${pageName}:`, metrics);

        // Example: Send to your analytics service
        // analytics.track('page_performance', {
        //   page: pageName,
        //   ...metrics
        // });
      }
    });

    // Observe all performance entry types
    try {
      observer.observe({
        entryTypes: ["navigation", "paint", "layout-shift", "first-input"],
      });
    } catch {
      // Fallback for browsers that don't support all entry types
      try {
        observer.observe({ entryTypes: ["navigation", "paint"] });
      } catch {
        console.warn("Performance observer not supported");
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [pageName, enabled]);
}

// Web Vitals measurement
export function measureWebVitals() {
  if (typeof window === "undefined") return;

  // Measure and report Core Web Vitals
  const reportWebVital = (metric: {
    name: string;
    value: number;
    id: string;
  }) => {
    console.log(`Web Vital - ${metric.name}:`, metric.value);

    // In production, send to your analytics service
    // analytics.track('web_vital', {
    //   name: metric.name,
    //   value: metric.value,
    //   id: metric.id
    // });
  };

  // LCP - Largest Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      reportWebVital({
        name: "LCP",
        value: entry.startTime,
        id: (entry as PerformanceEntry & { id?: string }).id || "unknown",
      });
    }
  }).observe({ entryTypes: ["largest-contentful-paint"] });

  // FID - First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      reportWebVital({
        name: "FID",
        value:
          (entry as PerformanceEntry & { processingStart: number })
            .processingStart - entry.startTime,
        id: (entry as PerformanceEntry & { id?: string }).id || "unknown",
      });
    }
  }).observe({ entryTypes: ["first-input"] });

  // CLS - Cumulative Layout Shift
  let clsValue = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (
        !(entry as PerformanceEntry & { hadRecentInput?: boolean })
          .hadRecentInput
      ) {
        clsValue += (entry as PerformanceEntry & { value: number }).value;
        reportWebVital({
          name: "CLS",
          value: clsValue,
          id: (entry as PerformanceEntry & { id?: string }).id || "unknown",
        });
      }
    }
  }).observe({ entryTypes: ["layout-shift"] });
}

// Image loading performance
export function trackImageLoading(imageUrl: string, imageName: string) {
  if (typeof window === "undefined") return;

  const startTime = performance.now();

  const img = new Image();
  img.onload = () => {
    const loadTime = performance.now() - startTime;
    console.log(`Image loaded - ${imageName}: ${loadTime.toFixed(2)}ms`);

    // Track slow loading images
    if (loadTime > 2000) {
      // 2 seconds threshold
      console.warn(
        `Slow image loading detected: ${imageName} took ${loadTime.toFixed(
          2
        )}ms`
      );

      // In production, report slow images
      // analytics.track('slow_image_loading', {
      //   image: imageName,
      //   loadTime,
      //   url: imageUrl
      // });
    }
  };

  img.onerror = () => {
    console.error(`Failed to load image: ${imageName}`);

    // In production, report image failures
    // analytics.track('image_load_error', {
    //   image: imageName,
    //   url: imageUrl
    // });
  };

  img.src = imageUrl;
}

// Bundle size monitoring
export function monitorBundleSize() {
  if (typeof window === "undefined") return;

  // Monitor large chunks
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "resource" && entry.name.includes(".js")) {
        const resourceEntry = entry as PerformanceResourceTiming;
        const size = resourceEntry.transferSize || 0;

        // Report large JavaScript files (> 500KB)
        if (size > 500 * 1024) {
          console.warn(
            `Large JS bundle detected: ${entry.name} - ${(size / 1024).toFixed(
              2
            )}KB`
          );

          // In production, report large bundles
          // analytics.track('large_bundle_detected', {
          //   url: entry.name,
          //   size: size,
          //   sizeKB: size / 1024
          // });
        }
      }
    }
  });

  try {
    observer.observe({ entryTypes: ["resource"] });
  } catch {
    console.warn("Resource performance observer not supported");
  }

  return () => observer.disconnect();
}
