import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  printContent(content: string, cssPath: string = 'assets/css/printPDF.css') {
    let height = window.screen.availHeight-100;
    let width = window.screen.availWidth-150;
    var printWindow = window.open('', '', `height=${height},width=${width}`);
    if (printWindow != null){
      printWindow.document.write('<html><head><title></title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  data = [
    { name: 'John', age: 30 },
    { name: 'Mary', age: 25 }
  ];


  public exportAsExcelFile(parsedQuestions: any[], excelFileName: string): void {
    // Define custom headers
  const headers = [
    "Question - max 120 characters", 
    "Answer 1 - max 75 characters", 
    "Answer 2 - max 75 characters", 
    "Answer 3 - max 75 characters", 
    "Answer 4 - max 75 characters", 
    "Time limit (sec) – 5, 10, 20, 30, 60, 90, 120, or 240 secs", 
    "Correct answer(s) - choose at least one"
  ];

  // Convert parsedQuestions to JSON, with headers as the first row
  const dataWithHeaders = [
    headers, // Custom headers row
    ...parsedQuestions.map(q => [
      q.question,
      q.answer1,
      q.answer2,
      q.answer3,
      q.answer4,
      q.timeLimitStr,
      q.correctAnswerStr
    ])
  ];

    // Create worksheet and workbook
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataWithHeaders);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Generate and save Excel file
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: EXCEL_TYPE});
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }
}
