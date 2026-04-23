import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { zoomInOnEnter, fadeInDownOnEnter, fadeInUpOnEnter } from '@ngverse/motion/animatecss';

import { AuthService } from '../../services/auth-service/auth-service.service';
import { StorageService } from '../../services/storage.service';
import { ThemeService } from '../../services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule, TranslatePipe],
  animations: [
    zoomInOnEnter({ duration: 500 }),
    fadeInDownOnEnter({ duration: 600, delay: 200 }),
    fadeInUpOnEnter({ duration: 600, delay: 300 })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  
  isSubmitted = signal(false);
  showPassword = signal(false);
  isLoading = signal(false);
  loginSuccess = signal(false);
  isLightTheme = signal(false);

  constructor(
    private fb: FormBuilder,
    private toast: NotificationService,
    private router: Router,
    private authService: AuthService,
    private storage: StorageService,
    private themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.isLightTheme.set(this.themeService.isLightTheme);
  }

  get username(): AbstractControl | null {
    return this.loginForm.get('username');
  }

  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.isSubmitted.set(true);
    if (this.loginForm.invalid) {
      this.toast.error('Please enter valid credentials.', 'Error');
      return;
    }

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).pipe(
      catchError((err) => {
        const msg = err?.error?.message || 'Login failed. Check your credentials.';
        this.toast.error(msg, 'Error');
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;
      this.toast.success('Login successful', 'Success');
      this.loginSuccess.set(true);
      setTimeout(() => this.router.navigate(['/dashboard']), 900);
    });
  }

  togglePassword(): void {
    this.showPassword.update(s => !s);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isLightTheme.set(this.themeService.isLightTheme);
  }

  resetForm(): void {
    this.isSubmitted.set(false);
    this.isLoading.set(false);
    this.showPassword.set(false);
    this.loginForm.reset();
  }
}
