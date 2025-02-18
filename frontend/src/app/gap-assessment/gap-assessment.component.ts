import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-gap-assessment',
  // imports: [],
  templateUrl: './gap-assessment.component.html',
  styleUrl: './gap-assessment.component.css'
})
export class GapAssessmentComponent {
  selectedFile: File | null = null;
  constructor(private apiService: ApiService){};

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

}
