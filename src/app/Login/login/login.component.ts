import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpserviceService } from '../../services/httpservice.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule],

})
export class LoginComponent {
  loginForm: FormGroup;
  submit: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpserviceService, private toastmsg: ToastrService, private router: Router, private authService: AuthService) {
    {console.log('entered login component')}

    this.loginForm = this.fb.group({
      User: ['', [Validators.required]], //
      password: ['', [Validators.required, Validators.minLength(6)]], // Password field with validation
    });
  }

  get User() {
    return this.loginForm.get('User');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    this.submit = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).pipe(
        catchError((err) => {
          this.toastmsg.error('Login failed: ' + err, 'Error');  // Show error message
          return []; // Return an empty array or some fallback value
        })
      ).subscribe(
        (res) => {
          this.authService.setAuthToken(res.token); // Set token in AuthService
          this.toastmsg.success('Login successful', 'Success'); // Show success message
          localStorage.setItem('LogedInUser' ,this.loginForm.value.User )
          this.router.navigate(['/dashboard']); // Navigate to dashboard after login
        }
      );

      // Here, you can send the login data to your API
    } else {
      this.toastmsg.error('enter valid credentail', 'error');
    }
  }
  RestForm()
  {
    this.submit = false;
    this.loginForm.clearValidators()
    this.loginForm.reset()
  }
}

