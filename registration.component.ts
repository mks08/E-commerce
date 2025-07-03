import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

// Password Validator
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null;
  }

  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone:false,
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})

export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService

    // form controls
  ) { 
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: passwordMatchValidator
    });
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid || this.isLoading) {
      return;
    }
    this.isLoading = true; // make this true 
    
    const { name, email, password } = this.registerForm.value;
    // Sends the data to register in AuthService 
    this.authService.register(name, email, password)
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: () => {
        this.notificationService.showSuccess('Registration successful! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.notificationService.showError(err.message || 'Registration failed.');
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
