import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StateService } from '../services/state.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-gap-assessment',
  // imports: [],
  templateUrl: './gap-assessment.component.html',
  styleUrl: './gap-assessment.component.css'
})
export class GapAssessmentComponent {

  selectedFile: File | null = null;
  gapTestForm: FormGroup<any>;
  gapTest: SafeHtml = '';
  gapTestName: String = '';
  loading: boolean = false; 
  testActive: boolean = false; 
  questions: any[] = [];

  constructor(private apiService: ApiService, private fb: FormBuilder, private stateService: StateService,
    private markdownService: MarkdownService){
    this.gapTestForm = this.fb.group({
      topic: [''],
      numberOfQuestions: [''],
      gradeLevel: [''],
      commonCoreStandards: [''],
      skills: [''],
      questionType: [''],
      state: ['']
      //may need to add more fields here, subject, county etc.
    });
  };

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  createGapAssessment(){
    console.log("Sending to backend");
    this.apiService.generateGapAssessment(this.selectedFile).subscribe({
      next: (val)=>{
        console.log("the service next call is here")
      }
    });
    console.log("returned from the backend call");
  }

  createGapTest() {
    this.loading = true;
    const formData = this.gapTestForm.value;
    
    this.apiService.generateGapTest(formData).subscribe({
      next: async (response: any) => {
        console.log('gap test created successfully:', response);
        const topic = this.gapTestForm.get('topic')?.value
        const state = this.gapTestForm.get('state')?.value;
        const gradeLevel = this.gapTestForm.get('gradeLevel')?.value;
        this.gapTestName = `${state} ${gradeLevel} Grade Level Standardized Test`

        //this.questions = ... not sure the format of the response yet

        this.gapTest = await this.markdownService.convert(response.test);
        this.stateService.setTestData(this.gapTest); //allows to retain test preferences when switching tabs
      },
      error: (error: any) => {
        console.error('error creating gap test:', error);
        // Handle error logic here (e.g., show an error message)
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  beginTest() {
      this.testActive = true; 
      this.createGapTest();
  }

  finishTest() {
    this.testActive = false;
  }
}
