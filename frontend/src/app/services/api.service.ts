import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  // API Url, switch these around to do local or production environments
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  generateTest(topic: any): Observable<any> {
    // console.log("AI formdata: ", topic);
    return this.http.post<any>(`${this.apiUrl}/test`, topic);
  }

  generateGapAssessment(file: File | null) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/gap-assessment`, file);
  }

  generateGapTest(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/gap-test`, formData);
  }


  // Send auth info to the backend
  sendAuthInfoToBackend(user: any): Observable<any> {
    console.log("Made it to sendAuthInfoToBackend");
    return this.http.post(`${this.apiUrl}/auth/google`, user);
  }
}