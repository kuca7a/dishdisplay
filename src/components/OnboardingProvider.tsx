"use client";

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  SkipForward,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    state,
    nextStep,
    prevStep,
    skipFlow,
    getCurrentFlow,
    getCurrentStep,
    checkForAutoStart
  } = useOnboarding();

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [targetElement, setTargetElement] = React.useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

  // Check for auto-start when route changes
  useEffect(() => {
    checkForAutoStart(pathname);
  }, [pathname, checkForAutoStart]);

  // Ensure body scrolling is not blocked during onboarding
  useEffect(() => {
    if (state.isActive) {
      // Ensure scrolling is always enabled
      document.body.style.overflow = 'auto';
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
      
      // Remove any potential scroll-locking classes
      document.body.classList.remove('overflow-hidden', 'scroll-lock');
      document.documentElement.classList.remove('overflow-hidden', 'scroll-lock');
      
      return () => {
        // Clean up on unmount
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.pointerEvents = '';
      };
    }
  }, [state.isActive]);

  // Additional scroll event handling to ensure modals stay visible
  useEffect(() => {
    if (state.isActive) {
      const handleScroll = (e: Event) => {
        // Don't prevent scroll - just ensure modal repositions correctly
        e.stopPropagation();
      };

      // Add passive scroll listeners to avoid blocking
      document.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        document.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [state.isActive]);

  // Update target element and position when step changes
  useEffect(() => {
    if (state.isActive) {
      const currentStep = getCurrentStep();
      if (currentStep) {
        const updateTargetAndPosition = () => {
          const element = document.querySelector(currentStep.target);
          setTargetElement(element);
          
          if (element) {
            const rect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
            let top = 0;
            let left = 0;
            const modalWidth = 320; // w-80 = 320px
            const modalHeight = 200; // Approximate height
            const padding = 16;
            
            // Calculate position based on placement with viewport constraints
            switch (currentStep.placement) {
              case 'top':
                top = rect.top + scrollTop - modalHeight - padding;
                left = rect.left + scrollLeft + (rect.width / 2); // Center point of element
                // Ensure modal doesn't go off-screen
                if (top < scrollTop + padding) {
                  top = rect.bottom + scrollTop + padding; // Flip to bottom
                }
                break;
              case 'bottom':
                top = rect.bottom + scrollTop + padding;
                left = rect.left + scrollLeft + (rect.width / 2); // Center point of element
                break;
              case 'left':
                top = rect.top + scrollTop + (rect.height / 2);
                left = rect.left + scrollLeft; // Left edge - modal will be positioned to the left
                // Ensure modal doesn't go off-screen
                if (left - modalWidth < scrollLeft + padding) {
                  left = rect.right + scrollLeft; // Flip to right
                }
                break;
              case 'right':
                top = rect.top + scrollTop + (rect.height / 2);
                left = rect.right + scrollLeft; // Right edge of element
                break;
              default:
                top = rect.bottom + scrollTop + padding;
                left = rect.left + scrollLeft + (rect.width / 2); // Center point of element
            }
            
            // Basic viewport constraints for vertical positioning
            const viewportHeight = window.innerHeight;
            
            // Vertical constraints - with smart fallbacks
            if (top < scrollTop + padding) {
              // If modal would be above viewport, position it below the element
              top = rect.bottom + scrollTop + padding;
            } else if (top + modalHeight > scrollTop + viewportHeight - padding) {
              // If modal would be below viewport, position it above the element
              top = Math.max(scrollTop + padding, rect.top + scrollTop - modalHeight - padding);
            }
            
            // Final safety check for vertical positioning
            top = Math.max(scrollTop + padding, Math.min(top, scrollTop + viewportHeight - modalHeight - padding));
            
            // Note: Horizontal positioning is handled in the Tooltip component
            
            setTooltipPosition({ top, left });
            
            // Scroll element into view if needed
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'center'
            });
            
            // Ensure the element stays interactive
            const htmlElement = element as HTMLElement;
            htmlElement.style.position = 'relative';
            htmlElement.style.zIndex = '45';
            htmlElement.style.pointerEvents = 'auto';
          }
        };

        // Wait a bit for DOM to update
        setTimeout(updateTargetAndPosition, 100);
        
        // Update position on window resize and scroll
        const handleUpdate = () => {
          requestAnimationFrame(updateTargetAndPosition);
        };
        
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate);
        
        return () => {
          window.removeEventListener('resize', handleUpdate);
          window.removeEventListener('scroll', handleUpdate);
        };
      }
    }
  }, [state.isActive, state.currentStep, getCurrentStep]);

  if (!state.isActive) {
    return <>{children}</>;
  }

  const currentFlow = getCurrentFlow();
  const currentStep = getCurrentStep();

  if (!currentFlow || !currentStep) {
    return <>{children}</>;
  }

  // Debug logging (can be removed in production)
  console.log('Onboarding Active:', { 
    isActive: state.isActive, 
    currentFlow: currentFlow?.id, 
    currentStep: state.currentStep,
    stepTitle: currentStep?.title,
    target: currentStep?.target 
  });

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === currentFlow.steps.length - 1;

  const handleNext = () => {
    if (currentStep.action) {
      switch (currentStep.action.type) {
        case 'navigate':
          if (currentStep.action.target) {
            window.location.href = currentStep.action.target;
          }
          break;
        case 'wait':
          setTimeout(() => {
            nextStep();
          }, currentStep.action.delay || 1000);
          return;
      }
    }
    nextStep();
  };

  const Overlay = () => {
    if (!targetElement) return null;
    
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const elementTop = rect.top + scrollTop;
    const elementLeft = rect.left + scrollLeft;
    const elementWidth = rect.width;
    const elementHeight = rect.height;
    
    // Add padding around the highlighted element
    const padding = 8;
    const highlightTop = elementTop - padding;
    const highlightLeft = elementLeft - padding;
    const highlightWidth = elementWidth + (padding * 2);
    const highlightHeight = elementHeight + (padding * 2);

    return (
      <>        
        {/* Highlight border around the target element - no overlay blocking scroll */}
        <div
          className="fixed z-40 pointer-events-none rounded-lg"
          style={{
            top: highlightTop,
            left: highlightLeft,
            width: highlightWidth,
            height: highlightHeight,
            border: '3px solid #5F7161',
            backgroundColor: 'rgba(95, 113, 97, 0.1)',
            boxShadow: '0 0 0 4px rgba(95, 113, 97, 0.3), 0 0 30px rgba(95, 113, 97, 0.4)',
            animation: 'pulse 2s infinite'
          }}
        />
      </>
    );
  };

  const Tooltip = () => {
    const placement = currentStep.placement || 'bottom';
    
    // Calculate final position accounting for modal width
    const modalWidth = 320; // w-80 = 320px
    const finalLeft = tooltipPosition.left - (modalWidth / 2); // Center the modal manually
    
    return (
      <div
        ref={tooltipRef}
        className="fixed z-50 pointer-events-none"
        style={{
          top: tooltipPosition.top,
          left: Math.max(16, Math.min(finalLeft, window.innerWidth - modalWidth - 16)), // Ensure it stays in viewport
          width: '320px'
        }}
      >
        <Card className="w-80 shadow-2xl border-2 border-[#5F7161] pointer-events-auto bg-white">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#5F7161]" />
                <Badge variant="outline" className="text-xs">
                  {state.currentStep + 1} of {currentFlow.steps.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={skipFlow}
                className="p-1 h-auto hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {currentStep.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#5F7161] h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((state.currentStep + 1) / currentFlow.steps.length) * 100}%` 
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevStep}
                      className="text-xs hover:bg-gray-50"
                    >
                      <ArrowLeft className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipFlow}
                    className="text-xs text-gray-500 hover:bg-gray-50"
                  >
                    <SkipForward className="h-3 w-3 mr-1" />
                    Skip Tour
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-[#5F7161] hover:bg-[#4C5B4F] text-xs"
                  >
                    {isLastStep ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simplified arrow - positioned relative to card */}
        {placement === 'bottom' && (
          <div
            className="absolute w-0 h-0"
            style={{
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid white',
            }}
          />
        )}
        {placement === 'top' && (
          <div
            className="absolute w-0 h-0"
            style={{
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      {children}
      <Overlay />
      <Tooltip />
      
      {/* Ensure scrolling is never blocked */}
      <div 
        className="fixed inset-0 pointer-events-none z-30"
        style={{ 
          background: 'transparent',
          overflow: 'visible'
        }}
      />
      
      <style jsx global>{`
        /* Ensure scrolling is always enabled */
        body, html {
          overflow: auto !important;
          pointer-events: auto !important;
        }
        
        /* Prevent any scroll-locking */
        .overflow-hidden, .scroll-lock {
          overflow: auto !important;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
