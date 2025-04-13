import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';
import { ViewChild, ElementRef } from '@angular/core';
import { StateService } from '../services/state.service';
import { Question } from '../shared/question.model';

@Component({
  selector: 'app-test-creator',
  // standalone: true,
  // imports: [FormOptionsComponent],
  templateUrl: './test-creator.component.html',
  styleUrl: './test-creator.component.css'
})
export class TestCreatorComponent {
  testForm: FormGroup;
  test: SafeHtml = '';
  //testString = ''
  loading: boolean = false;
  editTest: boolean = false;
  questionTypes: string[] = [''];

  testActive: boolean = false;; 
  testComplete: boolean = false; 
  questions: Question[] = []; 
  testName: string = '';

  @ViewChild('dataToExport', { static: false })
  public dataToExport!: ElementRef;

  constructor(private fb: FormBuilder, private apiService: ApiService, private markdownService: MarkdownService, private stateService: StateService) {
    this.testForm = this.fb.group({
      topic: [''],
      numberOfQuestions: [''],
      gradeLevel: [''],
      commonCoreStandards: [''],
      skills: [''],
      questionType: [this.questionTypes],
      state: ['']
    });

    // Load existing data if available
    this.test = this.stateService.getTestData();
  }

  generateTest(): void {
    this.loading = true;
    const formData = this.testForm.value;
    this.apiService.generateTest(formData).subscribe({
      next: async (response: any) => {
        this.testName = `${formData.state} ${formData.gradeLevel} Grade Level Test`;
        //this.testString = await this.markdownService.convertHtml(response.test);
      
        this.test = await this.markdownService.convert(response.test);
  
        this.stateService.setTestData(this.test);
        this.loading = false;
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
    console.log("made it to beginTest()")
    console.log(this.testActive)

    const allowedtypes = ['Multiple Choice', 'True/False'];
    const selectedTypes: string[] = this.testForm.value.questionType;

    const hasInvalidType = selectedTypes.some(
      (type) => !allowedtypes.includes(type)
    )

    if (hasInvalidType) {
      alert('Only Multiple Choice and True or False are allowed when taking a test.');
    return;
    }
  }

  finishTest() {
    this.testActive = false;
    this.testComplete = true;
  }

  // Method to handle user edits
  async onContentChange(event: Event) {
    this.editTest = true;
  }

  saveTest() {
    this.editTest = false;

    const editedHtml = this.dataToExport.nativeElement.innerHTML
    // TODO: sanitize updated HTML to ensure safety
    this.test = editedHtml;
    this.stateService.setTestData(editedHtml);

    // Convert sanitized HTML to markdown
    //this.testString = editedHtml.toString();
    //console.log("New test string: ", this.testString);
    }

}