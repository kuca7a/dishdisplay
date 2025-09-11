import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showNext?: boolean;
  showPrev?: boolean;
  action?: {
    type: 'navigate' | 'click' | 'wait';
    target?: string;
    delay?: number;
  };
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  triggers: {
    route?: string;
    condition?: () => boolean;
  };
}

// Define onboarding flows
export const onboardingFlows: OnboardingFlow[] = [
  {
    id: 'restaurant-setup',
    name: 'Restaurant Setup',
    description: 'Get started with setting up your restaurant profile',
    triggers: {
      route: '/profile',
      condition: () => true
    },
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to DishDisplay! 🎉',
        description: 'Let\'s get your restaurant set up in just a few steps. This tour will guide you through the essential features.',
        target: '[data-onboarding="welcome"]',
        placement: 'bottom',
        showNext: true,
        showPrev: false
      },
      {
        id: 'business-profile',
        title: 'Set Up Your Business Profile',
        description: 'Start by adding your restaurant\'s basic information, contact details, and business type.',
        target: '[data-onboarding="business-profile"]',
        placement: 'right',
        action: {
          type: 'navigate',
          target: '/profile/business-profile'
        }
      },
      {
        id: 'menu-management',
        title: 'Add Your Menu Items',
        description: 'Upload photos and details of your delicious dishes. This is what customers will see when they scan your QR code.',
        target: '[data-onboarding="menu-manage"]',
        placement: 'right',
        action: {
          type: 'navigate',
          target: '/profile/menu/manage'
        }
      },
      {
        id: 'qr-code',
        title: 'Generate Your QR Code',
        description: 'Create QR codes for your tables. Customers will scan these to view your digital menu.',
        target: '[data-onboarding="qr-code"]',
        placement: 'right',
        action: {
          type: 'navigate',
          target: '/profile/qr-code'
        }
      },
      {
        id: 'insights',
        title: 'Track Your Performance',
        description: 'View analytics about your menu performance, customer engagement, and popular items.',
        target: '[data-onboarding="insights"]',
        placement: 'right',
        action: {
          type: 'navigate',
          target: '/profile/insights'
        }
      }
    ]
  },
  {
    id: 'menu-management',
    name: 'Menu Management',
    description: 'Learn how to manage your menu items effectively',
    triggers: {
      route: '/profile/menu/manage'
    },
    steps: [
      {
        id: 'add-menu-item',
        title: 'Add Your First Menu Item',
        description: 'Click here to add a new dish to your menu. Make sure to include a great photo and detailed description!',
        target: '[data-onboarding="add-menu-item"]',
        placement: 'bottom'
      },
      {
        id: 'menu-categories',
        title: 'Organize by Categories',
        description: 'Use categories (Appetizers, Mains, Desserts, Drinks) to help customers navigate your menu easily.',
        target: '[data-onboarding="menu-categories"]',
        placement: 'top'
      },
      {
        id: 'menu-preview',
        title: 'Preview Your Menu',
        description: 'Always preview how your menu looks to customers before making it live.',
        target: '[data-onboarding="menu-preview"]',
        placement: 'left'
      }
    ]
  },
  {
    id: 'analytics-tour',
    name: 'Analytics Dashboard',
    description: 'Understand your analytics and insights',
    triggers: {
      route: '/profile/insights'
    },
    steps: [
      {
        id: 'overview-metrics',
        title: 'Overview Metrics',
        description: 'These cards show your key performance indicators: menu views, QR scans, and customer engagement.',
        target: '[data-onboarding="overview-metrics"]',
        placement: 'bottom'
      },
      {
        id: 'menu-performance',
        title: 'Menu Performance',
        description: 'See which menu items are most popular and how customers interact with them.',
        target: '[data-onboarding="menu-performance"]',
        placement: 'top'
      },
      {
        id: 'export-analytics',
        title: 'Export Your Data',
        description: 'Download detailed reports in PDF or Excel format for deeper analysis.',
        target: '[data-onboarding="export-analytics"]',
        placement: 'top'
      },
      {
        id: 'peak-hours',
        title: 'Peak Hours Analysis',
        description: 'Understand when your customers are most active to optimize your operations.',
        target: '[data-onboarding="peak-hours"]',
        placement: 'top'
      }
    ]
  }
];

interface OnboardingState {
  currentFlow: string | null;
  currentStep: number;
  isActive: boolean;
  completedFlows: string[];
  skippedFlows: string[];
}

export const useOnboarding = () => {
  const { user, isAuthenticated } = useAuth0();
  const [state, setState] = useState<OnboardingState>({
    currentFlow: null,
    currentStep: 0,
    isActive: false,
    completedFlows: [],
    skippedFlows: []
  });

  // Load onboarding state from localStorage
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const saved = localStorage.getItem(`onboarding_${user.email}`);
      if (saved) {
        try {
          const parsedState = JSON.parse(saved);
          setState(prevState => ({ ...prevState, ...parsedState }));
        } catch (error) {
          console.error('Failed to parse onboarding state:', error);
        }
      }
    }
  }, [isAuthenticated, user?.email]);

  // Save onboarding state to localStorage
  const saveState = (newState: Partial<OnboardingState>) => {
    if (user?.email) {
      const updatedState = { ...state, ...newState };
      setState(updatedState);
      localStorage.setItem(`onboarding_${user.email}`, JSON.stringify(updatedState));
    }
  };

  const startFlow = (flowId: string) => {
    const flow = onboardingFlows.find(f => f.id === flowId);
    if (flow && !state.completedFlows.includes(flowId) && !state.skippedFlows.includes(flowId)) {
      saveState({
        currentFlow: flowId,
        currentStep: 0,
        isActive: true
      });
    }
  };

  const nextStep = () => {
    const flow = getCurrentFlow();
    if (flow && state.currentStep < flow.steps.length - 1) {
      saveState({ currentStep: state.currentStep + 1 });
    } else {
      completeFlow();
    }
  };

  const prevStep = () => {
    if (state.currentStep > 0) {
      saveState({ currentStep: state.currentStep - 1 });
    }
  };

  const skipFlow = () => {
    if (state.currentFlow) {
      saveState({
        skippedFlows: [...state.skippedFlows, state.currentFlow],
        currentFlow: null,
        isActive: false,
        currentStep: 0
      });
    }
  };

  const completeFlow = () => {
    if (state.currentFlow) {
      saveState({
        completedFlows: [...state.completedFlows, state.currentFlow],
        currentFlow: null,
        isActive: false,
        currentStep: 0
      });
    }
  };

  const resetOnboarding = () => {
    saveState({
      currentFlow: null,
      currentStep: 0,
      isActive: false,
      completedFlows: [],
      skippedFlows: []
    });
  };

  const getCurrentFlow = (): OnboardingFlow | null => {
    return state.currentFlow ? onboardingFlows.find(f => f.id === state.currentFlow) || null : null;
  };

  const getCurrentStep = (): OnboardingStep | null => {
    const flow = getCurrentFlow();
    return flow ? flow.steps[state.currentStep] || null : null;
  };

  const checkForAutoStart = (pathname: string) => {
    // Check if current route should trigger an onboarding flow
    const availableFlow = onboardingFlows.find(flow => 
      flow.triggers.route === pathname && 
      !state.completedFlows.includes(flow.id) && 
      !state.skippedFlows.includes(flow.id) &&
      (!flow.triggers.condition || flow.triggers.condition())
    );

    if (availableFlow && !state.isActive) {
      startFlow(availableFlow.id);
    }
  };

  return {
    state,
    startFlow,
    nextStep,
    prevStep,
    skipFlow,
    completeFlow,
    resetOnboarding,
    getCurrentFlow,
    getCurrentStep,
    checkForAutoStart,
    flows: onboardingFlows
  };
};
