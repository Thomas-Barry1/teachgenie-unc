import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Question } from '../shared/question.model'


@Component({
  selector: 'app-active-test',
  //standalone: true,
  //imports: [],
  templateUrl: './active-test.component.html',
  styleUrl: './active-test.component.css'
})
export class ActiveTestComponent {
  //@Input() questions: any[] = ['Example question 1'] 
  @Input() questions: Question[] = []; //TO DO: receives real Gemini-generated questions from parent (GapAssessmentComponent)
  currentQuestionIndex: number = 0;
  selectedAnswer: string | null = null;
  selectedAnswers: any[] = [] // TO DO: figure out how to store state of answers (backend perhaps or as local storage)
  
  @Input() numberOfQuestions: number = 0;
  timeRemaining: number = 1800; // TO DO: create formula that calculates time or add it as input
  interval: any; 
  //testStages = ['user-info', 'questions', 'completion'];
  currentStage = ''
  userInfoForm: FormGroup; // TO DO: connect user data to backend 
  

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
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
    }
    else {
      this.currentStage = 'completion'
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedAnswer = null;
    }
  }

  selectAnswer(answer: string) {
    this.selectedAnswer= answer;
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
