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
    recommendations: string;
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
    this.assessment = {
      overallStrength: null,
      performanceSummary: '',
      standardsPerformance: [],
    };
  }

  ngOnInit() {
    console.log(this.assessment);
  }
}
