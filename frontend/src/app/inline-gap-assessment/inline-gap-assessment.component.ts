import { Component, Input } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StateService } from '../services/state.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';
import { Question } from '../shared/question.model';
import {
  InlineGapAssessment,
  StandardPerformance,
} from '../shared/inline_gap_assessment.models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  ChartDataset,
  ChartOptions,
  ChartData,
  Chart,
  registerables,
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-inline-gap-assessment',
  templateUrl: './inline-gap-assessment.component.html',
  styleUrls: ['./inline-gap-assessment.component.css'],
})
export class InlineGapAssessmentComponent {
  @Input() assessment: InlineGapAssessment;
  performanceSummary!: Promise<SafeHtml>;
  improvementPlan!: Promise<SafeHtml>;
  standards!: any[];

  // Chart Data
  dataSource = new MatTableDataSource();
  public chart: any;
  public labels: string[] = [];

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
          score: 100,
        },
      ],
      improvementPlan:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    };

    console.log('Constructor for inline gap assessment');
  }

  ngOnInit() {
    console.log('On init for inline gap assessment: ', this.assessment);
    this.improvementPlan = this.convertMarkdown(
      this.assessment.improvementPlan
    );
    this.performanceSummary = this.convertMarkdown(
      this.assessment.performanceSummary
    );
    this.standards = this.assessment.standardsPerformance.map((standard) => {
      return {
        standard: standard.standard,
        strength: standard.strength,
        description: this.markdownService.convert(standard.description),
      };
    });

    this.dataSource.data = this.assessment.standardsPerformance.map((item) => ({
      standard: item.standard,
      performance: item.description,
      score: item.score,
      strength: item.strength,
    }));

    this.labels = this.assessment.standardsPerformance.map(
      (item) => item.standard
    );
  }

  ngAfterViewInit() {
    this.createChart();
  }

  getMasteryStandards() {
    return this.assessment.standardsPerformance.filter(
      (standard) =>
        standard.strength === 'Strong' || standard.strength === 'strong'
    );
  }

  async convertMarkdown(bareMarkdown: string) {
    console.log('Start markdown in inline gap assessment');
    return await this.markdownService.convert(bareMarkdown);
  }

  getImprovementStandards() {
    return this.assessment.standardsPerformance.filter(
      (standard) =>
        standard.strength === 'Weak' ||
        standard.strength === 'Moderate' ||
        standard.strength === 'weak' ||
        standard.strength === 'moderate'
    );
  }

  createChart() {
    const canvas = document.getElementById('chart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Standards Performance',
            data: this.assessment.standardsPerformance.map(
              (standard) => standard.score
            ),
            backgroundColor: '#663399',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,

            ticks: {
              stepSize: 20,
            },
          },
        },
      },
    });
  }
}
