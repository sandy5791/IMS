import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  isSubmitted = false;
  showPassword = false;
  isLoading = false;
  loginSuccess = false;
  isLightTheme = false;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
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
    this.isLightTheme = this.themeService.isLightTheme;
  }

  get username(): AbstractControl | null {
    return this.loginForm.get('username');
  }

  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      this.toast.error('Please enter valid credentials.', 'Error');
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).pipe(
      catchError((err) => {
        this.toast.error('Login failed: ' + err, 'Error');
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((res) => {
      if (!res) return;

      this.authService.setAuthToken(res.token);
      this.toast.success('Login successful', 'Success');
      this.storage.setItem('LoggedInUser', this.loginForm.value.username);

      this.loginSuccess = true;
      setTimeout(() => this.router.navigate(['/dashboard']), 900);
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isLightTheme = this.themeService.isLightTheme;
  }

  resetForm(): void {
    this.isSubmitted = false;
    this.isLoading = false;
    this.showPassword = false;
    this.loginForm.reset();
  }
}
