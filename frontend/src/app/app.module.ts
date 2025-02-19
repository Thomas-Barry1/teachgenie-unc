import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOption } from '@angular/material/core';
import { MatSelectionList } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

// From primeng
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Google auth
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';

import { AppComponent } from './app.component';
import { TestCreatorComponent } from './test-creator/test-creator.component';
import { HomeComponent } from './home/home.component';
import { HomePageComponent } from './home-page/home-page.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { PrintButtonComponent } from './shared/print-button/print-button.component';
import { FormOptionsComponent } from './shared/form-options/form-options.component';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './shared/footer/footer.component';
import { GapAssessmentComponent } from './gap-assessment/gap-assessment.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    TestCreatorComponent,
    HomeComponent,
    HomePageComponent,
    PrintButtonComponent,
    FormOptionsComponent,
    FooterComponent,
    GapAssessmentComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatToolbarModule,
    MatIconModule,
    MatGridListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatOption,
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    MatListModule,
    BrowserModule,
    SocialLoginModule,
    // Primeng
    CarouselModule,
    ButtonModule,
    TagModule,
    LoginComponent,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false, // Optional: Automatically sign in the user
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '34044041449-47uhlcu7kpe4as5hitgp7nnojf0vdndm.apps.googleusercontent.com' // Google Client ID
            ),
          },
        ],
        onError: (err) => {
          console.error('Error: ', err);
        },
      } as SocialAuthServiceConfig,
    },
    provideCharts(withDefaultRegisterables()),
  ],
})
export class AppModule {}
