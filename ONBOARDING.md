# Onboarding System Documentation

## Overview

The DishDisplay onboarding system provides guided tours and tutorials to help restaurant owners learn how to use the platform effectively. Built using NextStepJS principles, it offers contextual, step-by-step guidance throughout the application.

## Features

### 🎯 **Multi-Flow Onboarding**
- **Restaurant Setup Flow**: Guides through initial restaurant profile setup
- **Menu Management Flow**: Teaches menu item management and organization
- **Analytics Tour Flow**: Introduces analytics dashboard and insights

### 🎨 **Interactive UI Elements**
- Highlighted target elements with pulsing animations
- Contextual tooltips with step-by-step instructions
- Progress tracking with visual indicators
- Skip and restart functionality

### 💾 **Persistent State Management**
- User-specific progress tracking via localStorage
- Automatic resumption of interrupted tours
- Completed/skipped flow tracking
- Cross-session state persistence

### 🔄 **Auto-Triggered Tours**
- Route-based automatic tour initiation
- Condition-based triggering logic
- Smart detection of completion status

## Architecture

### Core Components

#### 1. `useOnboarding` Hook (`/src/hooks/use-onboarding.ts`)
```typescript
const {
  state,           // Current onboarding state
  startFlow,       // Start a specific flow
  nextStep,        // Move to next step
  prevStep,        // Go back to previous step
  skipFlow,        // Skip current flow
  completeFlow,    // Mark flow as completed
  resetOnboarding, // Reset all progress
  getCurrentFlow,  // Get current flow object
  getCurrentStep,  // Get current step object
  checkForAutoStart // Check if tour should auto-start
} = useOnboarding();
```

#### 2. `OnboardingProvider` Component (`/src/components/OnboardingProvider.tsx`)
- Wraps the entire application
- Manages overlay, highlighting, and tooltip rendering
- Handles positioning and animations
- Provides step navigation controls

#### 3. `OnboardingControl` Component (`/src/components/OnboardingControl.tsx`)
- Control panel for managing onboarding
- Progress overview and flow status
- Manual flow starting and restarting
- Reset functionality

## Onboarding Flows

### 1. Restaurant Setup Flow
**Trigger:** `/profile` route  
**Steps:**
- Welcome message and overview
- Business profile setup guidance
- Menu management introduction
- QR code generation walkthrough
- Analytics dashboard tour

### 2. Menu Management Flow
**Trigger:** `/profile/menu/manage` route  
**Steps:**
- Add first menu item guidance
- Category organization tips
- Menu preview functionality

### 3. Analytics Tour Flow
**Trigger:** `/profile/insights` route  
**Steps:**
- Overview metrics explanation
- Menu performance insights
- Export functionality demonstration
- Peak hours analysis

## Implementation

### Adding Onboarding Attributes
Mark target elements with `data-onboarding` attributes:

```tsx
// Example: Marking a button for onboarding
<Button data-onboarding="add-menu-item">
  Add Menu Item
</Button>

// Example: Marking a section
<div data-onboarding="overview-metrics">
  {/* Metrics cards */}
</div>
```

### Creating New Flows
Add new flows to the `onboardingFlows` array in `use-onboarding.ts`:

```typescript
{
  id: 'new-flow',
  name: 'New Feature Tour',
  description: 'Learn about new features',
  triggers: {
    route: '/new-feature',
    condition: () => true // Optional condition
  },
  steps: [
    {
      id: 'step-1',
      title: 'Step Title',
      description: 'Step description',
      target: '[data-onboarding="target-element"]',
      placement: 'bottom'
    }
    // More steps...
  ]
}
```

### Step Configuration Options
```typescript
interface OnboardingStep {
  id: string;                    // Unique step identifier
  title: string;                 // Step title
  description: string;           // Step description
  target: string;                // CSS selector for target element
  placement?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip placement
  showNext?: boolean;            // Show next button
  showPrev?: boolean;            // Show previous button
  action?: {                     // Optional step action
    type: 'navigate' | 'click' | 'wait';
    target?: string;             // Navigation target
    delay?: number;              // Delay in milliseconds
  };
}
```

## Usage Examples

### Starting a Flow Programmatically
```typescript
const { startFlow } = useOnboarding();

// Start specific flow
startFlow('restaurant-setup');
```

### Checking Flow Status
```typescript
const { state } = useOnboarding();

// Check if flow is completed
const isCompleted = state.completedFlows.includes('restaurant-setup');

// Check if flow is currently active
const isActive = state.currentFlow === 'restaurant-setup' && state.isActive;
```

### Auto-Starting Based on Conditions
```typescript
// In component useEffect
useEffect(() => {
  const { checkForAutoStart } = useOnboarding();
  checkForAutoStart(pathname);
}, [pathname]);
```

## Styling and Theming

### CSS Classes Used
- `.fixed.inset-0.bg-black.bg-opacity-50` - Dark overlay
- `.border-[#5F7161]` - Brand color borders
- `.bg-[#5F7161]` - Brand color backgrounds
- `.animate-pulse` - Pulsing animation for highlights

### Customization
The onboarding system uses the existing design system:
- Brand colors: `#5F7161` (primary)
- UI components from `@/components/ui/`
- Consistent typography and spacing

## Integration Points

### Key Files Modified
1. `/src/app/layout.tsx` - Added OnboardingProvider wrapper
2. `/src/components/ProfileContent.tsx` - Added OnboardingControl component
3. `/src/components/InsightsContent.tsx` - Added onboarding attributes
4. `/src/components/app-sidebar.tsx` - Added navigation attributes
5. `/src/components/MenuManageContent.tsx` - Added menu management attributes

### Data Attributes Added
- `data-onboarding="welcome"` - Welcome section
- `data-onboarding="business-profile"` - Business profile link
- `data-onboarding="menu-manage"` - Menu management link
- `data-onboarding="qr-code"` - QR code generation link
- `data-onboarding="insights"` - Analytics link
- `data-onboarding="overview-metrics"` - Metrics overview section
- `data-onboarding="menu-performance"` - Menu performance section
- `data-onboarding="export-analytics"` - Export functionality
- `data-onboarding="peak-hours"` - Peak hours analysis
- `data-onboarding="add-menu-item"` - Add menu item button

## Best Practices

### 1. Progressive Disclosure
- Start with essential features first
- Introduce advanced features after basics are mastered
- Keep steps focused and actionable

### 2. Contextual Guidance
- Show tutorials when users are in relevant sections
- Provide just-in-time information
- Allow users to skip if they're experienced

### 3. Visual Clarity
- Use consistent highlighting and positioning
- Ensure tooltips don't obscure important content
- Provide clear progress indicators

### 4. Graceful Degradation
- System works without onboarding enabled
- No impact on core functionality
- Optional and non-intrusive by design

## Performance Considerations

### Lazy Loading
- OnboardingProvider only renders when active
- Minimal impact on initial page load
- Efficient event listener management

### Memory Management
- Automatic cleanup of event listeners
- Efficient state management with localStorage
- No memory leaks from incomplete tours

### Bundle Size
- Uses existing dependencies where possible
- Minimal additional JavaScript overhead
- Tree-shakeable components

## Future Enhancements

### Planned Features
1. **Analytics Integration** - Track onboarding completion rates
2. **A/B Testing** - Test different onboarding flows
3. **Video Tutorials** - Embedded video step guidance
4. **Interactive Demos** - Hands-on feature demonstrations
5. **Personalization** - Customized flows based on user type
6. **Multi-language** - Internationalization support

### Extensibility
The system is designed to be easily extensible:
- Add new flows by extending the configuration
- Create custom step types with different behaviors
- Integrate with external tutorial services
- Add custom animations and transitions

## Troubleshooting

### Common Issues

1. **Tooltip Not Appearing**
   - Check if target element exists in DOM
   - Verify `data-onboarding` attribute is set correctly
   - Ensure element is visible and not hidden

2. **Flow Not Auto-Starting**
   - Verify route trigger configuration
   - Check if flow is already completed/skipped
   - Ensure conditions are met

3. **Progress Not Persisting**
   - Check localStorage permissions
   - Verify user email is available for key generation
   - Clear localStorage to reset state if needed

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('onboarding_debug', 'true');
```

This will log onboarding state changes and flow transitions to the console.
