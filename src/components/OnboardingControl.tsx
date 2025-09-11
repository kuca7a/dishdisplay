"use client";

import React from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  XCircle,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Settings
} from 'lucide-react';

export default function OnboardingControl() {
  const {
    state,
    startFlow,
    resetOnboarding,
    flows
  } = useOnboarding();

  const getFlowIcon = (flowId: string) => {
    switch (flowId) {
      case 'restaurant-setup':
        return Settings;
      case 'menu-management':
        return BookOpen;
      case 'analytics-tour':
        return TrendingUp;
      default:
        return Lightbulb;
    }
  };

  const getFlowStatus = (flowId: string) => {
    if (state.completedFlows.includes(flowId)) {
      return { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    if (state.skippedFlows.includes(flowId)) {
      return { status: 'skipped', label: 'Skipped', color: 'bg-gray-100 text-gray-800', icon: XCircle };
    }
    if (state.currentFlow === flowId && state.isActive) {
      return { status: 'active', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock };
    }
    return { status: 'available', label: 'Available', color: 'bg-yellow-100 text-yellow-800', icon: Play };
  };

  const totalSteps = flows.reduce((acc, flow) => acc + flow.steps.length, 0);
  const completedSteps = state.completedFlows.reduce((acc, flowId) => {
    const flow = flows.find(f => f.id === flowId);
    return acc + (flow ? flow.steps.length : 0);
  }, 0);
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#5F7161]" />
          Onboarding & Tutorials
        </CardTitle>
        <CardDescription>
          Learn how to use DishDisplay effectively with guided tours and tutorials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-[#5F7161]/10 to-[#5F7161]/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
            <Badge variant="outline" className="text-[#5F7161] border-[#5F7161]">
              {Math.round(progressPercentage)}% Complete
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-[#5F7161] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {completedSteps} of {totalSteps} steps completed across all tutorials
          </p>
        </div>

        {/* Flow Cards */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Available Tutorials</h3>
          
          {flows.map((flow) => {
            const flowStatus = getFlowStatus(flow.id);
            const FlowIcon = getFlowIcon(flow.id);
            const StatusIcon = flowStatus.icon;
            
            return (
              <Card 
                key={flow.id} 
                className={`transition-all duration-200 hover:shadow-md ${
                  flowStatus.status === 'active' ? 'ring-2 ring-[#5F7161] bg-[#5F7161]/5' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-[#5F7161]/10 rounded-lg">
                        <FlowIcon className="h-5 w-5 text-[#5F7161]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{flow.name}</h4>
                          <Badge className={flowStatus.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {flowStatus.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{flow.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{flow.steps.length} steps</span>
                          {flow.triggers.route && (
                            <span>Available on: {flow.triggers.route}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {flowStatus.status === 'available' && (
                        <Button
                          onClick={() => startFlow(flow.id)}
                          size="sm"
                          className="bg-[#5F7161] hover:bg-[#4C5B4F]"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {(flowStatus.status === 'completed' || flowStatus.status === 'skipped') && (
                        <Button
                          onClick={() => startFlow(flow.id)}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Restart
                        </Button>
                      )}
                      
                      {flowStatus.status === 'active' && (
                        <Badge variant="secondary" className="animate-pulse">
                          <Clock className="h-3 w-3 mr-1" />
                          Step {state.currentStep + 1}/{flow.steps.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reset Option */}
        {(state.completedFlows.length > 0 || state.skippedFlows.length > 0) && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Reset All Progress</h4>
                <p className="text-sm text-gray-600">Start all tutorials from the beginning</p>
              </div>
              <Button
                onClick={resetOnboarding}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset All
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Tutorial Tips:</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Tutorials automatically start when you visit relevant pages</li>
                <li>• You can skip any tutorial at any time</li>
                <li>• Completed tutorials can be restarted for review</li>
                <li>• Each tutorial is designed to take 2-3 minutes</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
