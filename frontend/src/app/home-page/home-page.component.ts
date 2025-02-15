import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home-page',
  // standalone: true,
  // imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit{
  features = [
    { icon: 'school', title: 'Easy Lesson Planning', description: 'Generate comprehensive lesson plans effortlessly.' },
    { icon: 'assignment', title: 'Automated Test Creation', description: 'Create tests and quizzes in seconds.' },
    { icon: 'help_outline', title: '24/7 AI Assistance', description: 'Get instant help and support anytime, anywhere.' }
  ];

    responsiveOptions: any[] | undefined;

    constructor(private route: ActivatedRoute, private authService: AuthService) {
      if (!this.authService.getUserInfo()){
        this.authService.init();
      }
    }

    ngOnInit() {

       this.responsiveOptions = [
            {
                breakpoint: '1199px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '991px',
                numVisible: 1,
                numScroll: 1
            },
            {
                breakpoint: '767px',
                numVisible: 1,
                numScroll: 1
            }
        ];

        // Used to initialize auth service and pass in the right path
      this.route.url.subscribe(([url]) => {
        const { path, parameters } = url;
        console.log("About path: ", path); // e.g. /products
        console.log(parameters); // e.g. { id: 'x8klP0' }
        this.authService.returnUrl = path;
      });
    }
}
