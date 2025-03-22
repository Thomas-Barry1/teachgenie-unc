export interface InlineGapAssessment {
    overallStrength: 'Strong' | 'Moderate' | 'Weak' | null,
    performanceSummary: string,
    standardsPerformance: {
      standard: string;
      strength: 'Strong' | 'Moderate' | 'Weak' | null;
      description: string;
    }[],
    improvementPlan: string
  }