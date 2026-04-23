import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { loadingInterceptor, httpErrorInterceptor } from './interceptors/http-handlers.interceptors';

export function playerFactory() {
  return player;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    provideAnimations(),

    // ✅ Register functional interceptors: loading spinner + centralized error handling
    provideHttpClient(
      withInterceptors([loadingInterceptor, httpErrorInterceptor]),
      withInterceptorsFromDi()
    ),
    provideAnimationsAsync(),
    provideLottieOptions({
      player: () => playerFactory()
    }),
    provideCharts(withDefaultRegisterables())
  ]
};
