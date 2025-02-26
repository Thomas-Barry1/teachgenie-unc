import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { SafeHtml } from '@angular/platform-browser';
import { MarkdownService } from '../services/markdown.service';

interface SubjectScores {
  [subject: string]: number;
}

interface StudentPerformance {
  [studentName: string]: SubjectScores;
}

@Component({
  selector: 'app-gap-assessment',
  // imports: [],
  templateUrl: './gap-assessment.component.html',
  styleUrl: './gap-assessment.component.css'
})
export class GapAssessmentComponent {
  selectedFile: File | null = null;
  constructor(private apiService: ApiService, private markdownService: MarkdownService){};
  loading: Boolean = false;
  gap_assessment: SafeHtml = '';
  gap_assessmentString: string = '';
  extracted_information: StudentPerformance = {};

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  createGapAssessment(){
    if (!this.selectedFile) {
      console.error("No file selected!");
      return;
    }
    console.log("Sending to backend");
    this.loading = true;
    const formData = new FormData();
    formData.append("file", this.selectedFile);
    this.apiService.generateGapAssessment(formData).subscribe({
      next: async (val)=>{
        console.log("the service has returned:", val);
        this.loading = false;
        this.extracted_information = val.extracted_information;
        this.gap_assessment = await this.markdownService.convert(val.generated_gap_assessment);
        this.gap_assessmentString = await this.markdownService.convertHtml(val.generated_gap_assessment);
        console.log(`final extracted information for the table: ${this.extracted_information}`,  this.extracted_information);
      }
    });
    console.log("returned from the backend call");
  }

}
