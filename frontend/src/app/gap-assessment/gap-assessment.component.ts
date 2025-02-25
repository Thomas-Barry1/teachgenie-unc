import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { MarkdownService } from '../services/markdown.service';
import { SafeHtml } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { StateService } from '../services/state.service';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import {
  ChartDataset,
  ChartOptions,
  ChartData,
  Chart,
  registerables,
} from 'chart.js';

export interface StudentPerformance {
  name: string;
  Fractions: number;
  Algebra: number;
  Geometry: number;
}

// Chart Labels

export enum SubjectLabel {
  Fractions = 'Fractions',
  Algebra = 'Algebra',
  Geometry = 'Geometry',
}

export enum ChartType {
  student = 'Student',
  subject = 'Subject',
}

// Dummy Data
const STUDENT_DATA: StudentPerformance[] = [
  {
    name: 'Timmy',
    Fractions: 3,
    Algebra: 4,
    Geometry: 5,
  },
  {
    name: 'Tommy',
    Fractions: 5,
    Algebra: 5,
    Geometry: 5,
  },
  {
    name: 'Billy',
    Fractions: 2,
    Algebra: 1,
    Geometry: 3,
  },
  {
    name: 'Bobby',
    Fractions: 3,
    Algebra: 5,
    Geometry: 5,
  },
  {
    name: 'Jenny',
    Fractions: 4,
    Algebra: 2,
    Geometry: 3,
  },
  {
    name: 'Jessie',
    Fractions: 2,
    Algebra: 5,
    Geometry: 3,
  },
  {
    name: 'Cam',
    Fractions: 2,
    Algebra: 5,
    Geometry: 3,
  },
  {
    name: 'Connie',
    Fractions: 5,
    Algebra: 5,
    Geometry: 5,
  },
];
@Component({
  selector: 'app-gap-assessment',
  templateUrl: './gap-assessment.component.html',
  styleUrl: './gap-assessment.component.css',
})
export class GapAssessmentComponent {
  students: StudentPerformance[] = STUDENT_DATA;

  // MatTable Displayed Columns
  displayedColumns: string[] = ['name', 'Fractions', 'Algebra', 'Geometry'];

  private _liveAnnouncer = inject(LiveAnnouncer);

  dataSource = new MatTableDataSource(STUDENT_DATA);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    if (this.selectedSubject) {
      this.createSubjectChart(this.selectedSubject);
    }
  }

  constructor() {
    Chart.register(...registerables);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  // Chart JS
  public chart: any;

  subjectOptions = Object.values(SubjectLabel);
  selectedSubject: SubjectLabel | null = null;
  studentOptions = this.students.map((student) => student.name);
  selectedStudent: string | null = null;

  createSubjectChart(subject: SubjectLabel) {
    const canvas = document.getElementById('chart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: STUDENT_DATA.map((student) => student.name),
        datasets: [
          {
            label: `${subject} Performance`,
            data: this.students.map((student) => student[subject]),
            backgroundColor: '#3f51b5',
            borderWidth: 1,
          },
        ],
      },

      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  createStudentChart(studentName: string) {
    const canvas = document.getElementById('chart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy(); // Destroy the previous chart instance
    }

    const student = this.students.find((s) => s.name === studentName);
    if (!student) return;

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(SubjectLabel), // ['Fractions', 'Algebra', 'Geometry']
        datasets: [
          {
            label: `${studentName}'s Performance`,
            data: Object.values(SubjectLabel).map(
              (subject) => student[subject]
            ),
            backgroundColor: '#3f51b5',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  onSubjectChange(subject: SubjectLabel | null) {
    this.selectedSubject = subject;

    this.selectedStudent = null;

    if (!subject) {
      this.chart?.destroy();
      return;
    }

    this.createSubjectChart(subject);
  }

  onStudentChange(studentName: string | null) {
    this.selectedStudent = studentName;

    this.selectedSubject = null;

    setTimeout(() => (this.selectedSubject = null), 0);

    if (!studentName) {
      this.chart?.destroy();
      return;
    }

    this.createStudentChart(studentName);
  }

  applySearchFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.filter === '') {
      this.dataSource.filter = '';
    }
  }
}
