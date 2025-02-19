import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestCreatorComponent } from './test-creator/test-creator.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginComponent } from './login/login.component';
// Auth guard protects routes with authentication
import { AuthGuard } from './auth.guard';
import { GapAssessmentComponent } from './gap-assessment/gap-assessment.component';

const routes: Routes = [
  {
    path: 'test-creator',
    component: TestCreatorComponent,
    canActivate: [AuthGuard],
  },
  { path: 'home', component: HomePageComponent },
  { path: 'gap-assessment', component: GapAssessmentComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
