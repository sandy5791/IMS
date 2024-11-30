import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent,appConfig )
  .catch((err) => console.error(err));
