import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: false, 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  // disable button during API call
  isLoading = false;

  constructor(
    private fb: FormBuilder,                    
    private authService: AuthService,           
    private router: Router,                     
    private notificationService: NotificationService 
  ) {
    
    // form controls and validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], 
      password: ['', [Validators.required, Validators.minLength(6)]] 
    });
  }

  onSubmit() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }
    this.isLoading = true;
    
    const { email, password } = this.loginForm.value;
    // Sends the data to login in AuthService , uses the user object and performs next operation.
    this.authService.login(email, password).pipe(
      finalize(() => this.isLoading = false) 
    ).subscribe({ 
      next: (user) => {
        this.notificationService.showSuccess('Login successful!');

        // Redirect user based on role
        const redirectUrl = user.role === 'admin' ? '/dashboard/admin' : '/products';
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        this.notificationService.showError(err.message || 'Login failed.');
      }
    });
  }

 // Signup link
  goToSignup() {
    this.router.navigate(['/auth/register']);
  }
}
