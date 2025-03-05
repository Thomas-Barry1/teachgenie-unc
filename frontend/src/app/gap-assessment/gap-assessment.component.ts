import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StateService } from '../services/state.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';
import { Question } from '../shared/question.model';

@Component({
  selector: 'app-gap-assessment',
  // imports: [],
  templateUrl: './gap-assessment.component.html',
  styleUrl: './gap-assessment.component.css',
})
export class GapAssessmentComponent {
  selectedFile: File | null = null;
  gapTestForm: FormGroup<any>;
  gapTest: SafeHtml = '';
  gapTestName: String = '';

  loading: boolean = false;
  testActive: boolean = false;

  questions: Question[] = [];
  standards: any; //not sure types yet

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private stateService: StateService,
    private markdownService: MarkdownService
  ) {
    this.gapTestForm = this.fb.group({
      topic: [''],
      numberOfQuestions: [''],
      gradeLevel: [''],
      commonCoreStandards: [''],
      skills: [''],
      questionType: [''],
      state: [''],
    });

    // load existing data if available
    this.gapTest = this.stateService.getTestData();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  createGapAssessment() {
    console.log('Sending to backend');
    this.apiService.generateGapAssessment(this.selectedFile).subscribe({
      next: (val) => {
        console.log('the service next call is here');
      },
    });
    console.log('returned from the backend call');
  }

  getFormData(): any {
    return this.gapTestForm.value;
  }

  generateStandards() {
    this.loading = true;
    const formData = this.getFormData();

    this.apiService.generateStandards(formData).subscribe({
      next: (response: any) => {
        console.log('made it back to component');

        // store the standards for GAP assessment visualization later
        this.standards = response.standards;
        console.log(response.standards);
        2;
        // generate the test using the standards
        this.generateGapTest(formData, this.standards);
      },
      error: (error) => {
        console.error('Error generating standards from Gemini:', error);
        this.loading = false;
      },
    });
  }

  generateGapTest(formData: any, standards: any) {
    const testRequest = {
      ...formData,
      standards: standards,
    };

    this.apiService.generateGapTest(testRequest).subscribe({
      next: async (response: any) => {
        console.log('Raw API Response:', response);
        this.gapTestName = `${formData.state} ${formData.gradeLevel} Grade Level Test`;

        this.questions = this.parseApiResponse(response);
        localStorage.setItem('questions', JSON.stringify(this.questions));
        console.log(this.questions);
      },
      error: (error) => {
        console.error('Error creating gap test:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  parseApiResponse(response: any): Question[] {
    let questionsArray;

    // If response.test is already an array, use it directly
    if (Array.isArray(response.test)) {
      questionsArray = response.test;
    }
    // If response.test is a string, try parsing it
    else if (typeof response.test === 'string') {
      try {
        // Extract JSON if it's wrapped in markdown format (```json ... ```)
        const jsonMatch = response.test.match(/```json\n([\s\S]+)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : response.test;

        questionsArray = JSON.parse(jsonString);
      } catch (error) {
        throw new Error('Failed to parse JSON from response.test');
      }
    } else {
      throw new Error('Invalid response format');
    }

    // Transform data into the required format
    return questionsArray.map(
      (q: any): Question => ({
        question: q.Question,
        answerChoices: q.AnswerChoices,
        correctAnswer: q.CorrectAnswer,
      })
    );
  }

  beginTest() {
    this.testActive = true;
    this.generateStandards();
  }

  finishTest() {
    this.testActive = false;
  }
}
