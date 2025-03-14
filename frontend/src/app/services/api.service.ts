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
    console.log("Made it to frontend api service generate test")
    return this.http.post<any>(`${this.apiUrl}/test`, topic);
  }

  generateGapAssessment(file: File | null) : Observable<any>{
    console.log("Made it to frontend api service generate gap assessment");
    return this.http.post<any>(`${this.apiUrl}/gap-assessment`, file);
  }

  generateGapTest(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/test`, formData);
  }

  generateStandards(formData: any): Observable<any> { //could define interfaces/models to avoid 'any' typing
    console.log("Made it to frontend api service generate gap assessment");
    return this.http.post(`${this.apiUrl}/gap-standards`, formData);
  }

  // Send auth info to the backend
  sendAuthInfoToBackend(user: any): Observable<any> {
    console.log("Made it to sendAuthInfoToBackend");
    return this.http.post(`${this.apiUrl}/auth/google`, user);
  }
}