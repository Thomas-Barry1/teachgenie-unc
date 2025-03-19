import { Component, Input } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StateService } from '../services/state.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';
import { Question } from '../shared/question.model';

interface InlineGapAssessment {
  overallStrength: 'Strong' | 'Moderate' | 'Weak' | null;
  performanceSummary: string;
  standardsPerformance: {
    standard: string;
    strength: 'Strong' | 'Moderate' | 'Weak' | null;
    description: string;
  }[];
}

@Component({
  selector: 'app-inline-gap-assessment',
  templateUrl: './inline-gap-assessment.component.html',
  styleUrls: ['./inline-gap-assessment.component.css'],
})
export class InlineGapAssessmentComponent {
  @Input() assessment: InlineGapAssessment;

  constructor() {
    // Placeholder assessment
    this.assessment = {
      overallStrength: 'Moderate',
      performanceSummary:
        'This student shows a significant discrepancy in their test performance, excelling in some areas and completely failing in others. This suggests a possible issue with understanding specific mathematical concepts rather than a general lack of mathematical ability. A plan needs to address both the strengths and weaknesses.',
      standardsPerformance: [
        {
          standard: 'K.OA.A.1',
          strength: 'Strong',
          description: 'Understanding addition and subtraction within 5',
        },
        {
          standard: '4.NF.A.1',
          strength: 'Strong',
          description: 'Understanding equivalent fractions',
        },
        {
          standard: '3.OA.A.7',
          strength: 'Strong',
          description: 'Multiplying and dividing numbers less than 100',
        },
        {
          standard: '3.MD.C.5',
          strength: 'Weak',
          description:
            'Understands concepts of area and relating area to multiplication and addition',
        },
        {
          standard: '5.0A.A.2',
          strength: 'Weak',
          description: 'Writing and interpreting numerical expressions',
        },
      ],
    };
  }

  ngOnInit() {
    console.log(this.assessment);
  }

  getMasteryStandards() {
    return this.assessment.standardsPerformance.filter(
      (standard) => standard.strength === 'Strong'
    );
  }

  getImprovementStandards() {
    return this.assessment.standardsPerformance.filter(
      (standard) =>
        standard.strength === 'Weak' || standard.strength === 'Moderate'
    );
  }
}
