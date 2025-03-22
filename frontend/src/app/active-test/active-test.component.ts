import { Component, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Question } from '../shared/question.model';
import { EventEmitter } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Full_Question } from '../shared/full_question.model';

@Component({
  selector: 'app-active-test',
  //standalone: true,
  //imports: [],
  templateUrl: './active-test.component.html',
  styleUrl: './active-test.component.css',
})
export class ActiveTestComponent {
  @Output() taskCompleted = new EventEmitter<void>();
  @Input() questions: Question[] = [];
  currentQuestionIndex: number = 0;
  selectedAnswer: string | null = null;
  selectedAnswers: Full_Question[] = [];

  @Input() numberOfQuestions: number = 0;
  timeRemaining: number = 1800; // TO DO: create formula that calculates time or add it as input
  interval: any;
  //testStages = ['user-info', 'questions', 'completion'];
  currentStage = '';
  userInfoForm: FormGroup; // TO DO: connect user data to backend
  assessment: any;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.userInfoForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      teacherCode: [''],
    });
    this.currentStage = 'user-info';
    // this.selectedAnswers = Array(this.numberOfQuestions).fill(null);
  }

  onSubmitUserData() {
    this.currentStage = 'questions';
    this.startTimer();
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = null;
      console.log(this.selectedAnswers);
    } else {
      //submitting

      // let random_testing_data: [string] = ['Sample stuff here'];
      // console.log("Sending this data to create sample gap_assessment:", random_testing_data);
      // this.apiService.generateSampleGapAssessment(random_testing_data).subscribe({
      //   next: (res)=>{
      //     console.log("Frontend respnsoe from sampleGapAssessment", res)
      //   }
      // });

      // let question_sample_data: [Question] = [{
      //   question: "Sample question",
      //   answerChoices: ["A", "B", "C", "D"],
      //   correctAnswer: "B"
      // }];
      // this.apiService.generateSampleQuestionArrayGapAssessment(question_sample_data).subscribe({
      //   next: (res)=>{
      //     console.log("question sample response: ", res)
      //   }
      // });


      //conclusion: I can pass a nomal array as well as a question array but unable to pass fullquestionarray.


      // let full_question_sample_data: [Full_Question] = [{
      //   question: {
      //     question: "Sample question",
      //     answerChoices: ["A", "B", "C", "D"],
      //     correctAnswer: "B"
      //   },
      //   selected_answer: "B"
      // }];
      
      // console.log("Now sending a sample full question", full_question_sample_data);

      // this.apiService.generateGapAssessment(full_question_sample_data).subscribe({
      //   next: (res)=>{
      //     console.log("response form fullquestionapiservice", res)
      //   }
      // })
      
      //wait also full quesiton can be sent. what is the problem then?
      const send_data:Full_Question[] = this.selectedAnswers;
      console.log("Sending this data to create gap_assessment:", send_data);
      this.apiService.generateGapAssessment(this.selectedAnswers).subscribe({
        next: (res)=>{
          console.log("Response from generating gap assessment", res);
          this.assessment = res;
          this.taskCompleted.emit(this.assessment);
        }
      })
      
      this.currentStage = 'completion';
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.selectedAnswer = null;
    }
  }

  selectAnswer(answer: string) {
    this.selectedAnswer = answer;
    this.selectedAnswers[this.currentQuestionIndex] = {
      question: this.questions[this.currentQuestionIndex],
      selected_answer: this.selectedAnswer
    };
    localStorage.setItem(
      'selectedAnswers',
      JSON.stringify(this.selectedAnswers)
    );
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

  // TODO: Implement exit test
  exitTest() {
    localStorage.setItem('selectedAnswers', JSON.stringify([]));
    localStorage.setItem('questions', JSON.stringify([]));

    console.log('Test Exited');
  }
  show(){
    console.log(this.selectedAnswers); 
    console.log(this.selectedAnswers.length);
    console.log(this.questions.length);
  }
}
