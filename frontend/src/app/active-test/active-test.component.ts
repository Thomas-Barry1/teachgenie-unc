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
  @Input() questions: any[] = ['Example question 1'] //TO DO: receives real questions from parent (GapAssessmentComponent)
  currentQuestionIndex: number = 0;
  selectedAnswerIndex: number | null = null;
  selectedAnswers: any[] = [] // TO DO: figure out how to store state of answers (backend perhaps or as local array)
  
  @Input() numberOfQuestions: number = 0;
  timeRemaining: number = 1800; // TO DO: create formula that calculates time or add it as input
  interval: any; 
  //testStages = ['user-info', 'questions', 'completion'];
  currentStage = ''
  userInfoForm: FormGroup; // TO DO: connect data to backend 
  

  constructor(private fb: FormBuilder) {
    this.userInfoForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      teacherCode: ['']
    });
    this.currentStage = 'user-info'
  }

  onSubmitUserData() {
    this.currentStage = 'questions'
    this.startTimer(); 
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length-1) {
      console.log(this.currentQuestionIndex);
      console.log(this.questions.length);
      this.currentQuestionIndex++;
    }
    else {
      this.currentStage = 'completion'
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  selectAnswer(index: number) {
    this.selectedAnswerIndex = index;
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
