// app/quickstart/page.tsx
'use client';

import { useState } from 'react';
import { Card, Button, Accordion, Badge } from 'frantic-ui';

const HiringSteps = [
  {
    id: 'post-job',
    title: 'Post the Job',
    description: 'Create a compelling job description with clear responsibilities and requirements.',
    details: [
      'Use Frantic’s job template to ensure consistency',
      'Include salary range, location, and remote policy',
      'Add must-have and nice-to-have skill requirements',
      'Set application deadline if applicable'
    ]
  },
  {
    id: 'screen-candidates',
    title: 'Screen Candidates',
    description: 'Review applications and conduct initial screenings.',
    details: [
      'Use Frantic’s filtering tools to find qualified candidates',
      'Conduct 15-minute phone screens using the provided script',
      'Check references before moving to interviews',
      'Update candidate status in the Frantic dashboard'
    ]
  },
  {
    id: 'interview',
    title: 'Interview',
    description: 'Conduct structured interviews with top candidates.',
    details: [
      'Schedule interviews using Frantic’s calendar integration',
      'Use the standardized interview rubric for fairness',
      'Include team members in the interview process',
      'Provide timely feedback to candidates'
    ]
  },
  {
    id: 'offer',
    title: 'Make the Offer',
    description: 'Extend and manage the job offer.',
    details: [
      'Prepare offer letter using Frantic’s templates',
      'Negotiate compensation and start date',
      'Send formal offer and track acceptance status',
      'Onboard new hire using Frantic’s onboarding checklist'
    ]
  }
];

export default function QuickstartPage() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleStep = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  const toggleCompletion = (id: string) => {
    setCompletedSteps(prev => 
      prev.includes(id) 
        ? prev.filter(step => step !== id)
        : [...prev, id]
    );
  };

  const progress = Math.round((completedSteps.length / HiringSteps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Hiring Quickstart</h1>
          <p className="text-gray-600">Follow these steps to hire your first agent on Frantic</p>
          
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {HiringSteps.map((step) => (
            <Card key={step.id} className="border-l-4 border-l-blue-500">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <button
                    onClick={() => toggleCompletion(step.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      completedSteps.includes(step.id)
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {completedSteps.includes(step.id) && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      {expandedStep === step.id ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-gray-600">{step.description}</p>
                  
                  {expandedStep === step.id && (
                    <div className="mt-4 ml-9">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Actions:</h4>
                      <ul className="space-y-2">
                        {step.details.map((detail, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-400 mr-2"></span>
                            <span className="text-gray-700 text-sm">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="primary" size="lg" className="px-6">
            Complete Quickstart
          </Button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">
            If you have questions during the hiring process, check our 
            <a href="/help/hiring" className="text-blue-600 hover:underline ml-1">
              Hiring Guide
            </a>
            or contact our support team.
          </p>
          <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-100">
            View Hiring Resources
          </Button>
        </div>
      </div>
    </div>
  );
}