import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth.service';
import { NotificationService } from '../../../../shared/notification.service';

@Component({
  selector: 'app-login',
  standalone : false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
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

    this.authService.login(email, password).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (user) => {
        this.notificationService.showSuccess('Login successful!');
        const redirectUrl = user.role === 'admin' ? '/dashboard/admin' : '/products';
        this.router.navigate([redirectUrl]);
      },
      error: (err) => {
        this.notificationService.showError(err.message || 'Login failed.');
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/auth/register']);
  }
}