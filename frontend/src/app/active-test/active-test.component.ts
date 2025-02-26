import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-active-test',
  //standalone: true,
  //imports: [],
  templateUrl: './active-test.component.html',
  styleUrl: './active-test.component.css'
})
export class ActiveTestComponent {
  @Input() questions: any[] = ['Example question 1', 'Example question 2','Example question 3']; //receives questions from parent (GapAssessmentComponent)
  currentQuestionIndex: number = 0;
  timeRemaining: number = 1800; // need to either add time as an input/create a formula based on # of questions
  interval: any; 
  testStages = ['user-info', 'questions', 'completion'];
  currentStage = ''
  userInfoForm: FormGroup; // TO DO: connect data to backend 

  constructor(private fb: FormBuilder) {
    this.userInfoForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      teacherCode: ['']
    });
    this.currentStage = this.testStages[0];
  }

  onSubmitUserData() {
    this.currentStage = this.testStages[1];
    this.startTimer(); 
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length-1) {
      console.log(this.currentQuestionIndex);
      console.log(this.questions.length);
      this.currentQuestionIndex++;
    }
    else {
      this.currentStage = this.testStages[2];
    }
  }

  startTimer() {
    this.interval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`; // Ensures two-digit seconds
  }
}
