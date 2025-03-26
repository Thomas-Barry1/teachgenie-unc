import { Component, Input } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StateService } from '../services/state.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';
import { Question } from '../shared/question.model';
import { InlineGapAssessment } from '../shared/inline_gap_assessment.models';

@Component({
  selector: 'app-inline-gap-assessment',
  templateUrl: './inline-gap-assessment.component.html',
  styleUrls: ['./inline-gap-assessment.component.css'],
})
export class InlineGapAssessmentComponent {
  @Input() assessment: InlineGapAssessment;
  performanceSummary!: Promise<SafeHtml>;
  improvementPlan!: Promise<SafeHtml>;

  constructor(private markdownService: MarkdownService) {
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
      improvementPlan:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    };
    console.log("Constructor for inline gap assessment")
  }

  ngOnInit() {
    console.log("On init for inline gap assessment: ", this.assessment);
    this.improvementPlan = this.convertMarkdown(this.assessment.improvementPlan);
    this.performanceSummary = this.convertMarkdown(this.assessment.performanceSummary);
  }

  getMasteryStandards() {
    return this.assessment.standardsPerformance.filter(
      (standard) => standard.strength === 'Strong' || standard.strength === "strong"
    );
  }

  async convertMarkdown(bareMarkdown: string){
    console.log("Start markdown in inline gap assessment");
    return await this.markdownService.convert(bareMarkdown);
  }

  getImprovementStandards() {
    return this.assessment.standardsPerformance.filter(
      (standard) =>
        standard.strength === 'Weak' || standard.strength === 'Moderate' || standard.strength === "weak" || standard.strength === "moderate"
    );
  }
}
