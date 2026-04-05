import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export function playerFactory() {
  return player;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    provideAnimations(),
    provideToastr({ positionClass: 'toast-bottom-right', preventDuplicates: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    provideLottieOptions({
      player: () => playerFactory()
    }),
    provideCharts(withDefaultRegisterables())
  ]
};
