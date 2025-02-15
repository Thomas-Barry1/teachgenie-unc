import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
// This service stores the state of values when switching between pages
export class StateService {
  private testData: SafeHtml = '';

  setTestData(data: SafeHtml) {
    this.testData = data;
  }

  getTestData(): SafeHtml {
    return this.testData;
  }
}
