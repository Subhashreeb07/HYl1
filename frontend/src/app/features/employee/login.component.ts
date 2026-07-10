import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../core/services/auth-api.service';
import { SessionService } from '../../core/services/session.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f7f5f3] to-[#efe9e2] p-2">
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl md:p-8">
        <!-- Header -->
        <div class="mb-8 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d39c78] to-[#9a562d]">
            <span class="text-2xl">🏢</span>
          </div>
          <h1 class="text-3xl font-bold text-[#1f2937]">Workplace Hub</h1>
          <p class="mt-2 text-sm text-[#6b7280]">Secure enterprise access for the global workforce</p>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Employee ID Field -->
          <div>
            <label for="employeeId" class="block text-xs font-semibold uppercase tracking-wider text-[#7c5a45]">
              Employee ID
            </label>
            <input
              id="employeeId"
              type="text"
              formControlName="employeeId"
              aria-label="Employee ID"
              aria-describedby="employeeId-error"
              [class.border-red-500]="isFieldInvalid('employeeId')"
              class="mt-2 w-full rounded-lg border border-[#e5ddd5] bg-[#f9f7f5] px-4 py-3 text-sm text-[#1f2937] transition placeholder-[#9ca3af] focus:border-[#d39c78] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d39c78] focus:ring-opacity-20"
              placeholder="Enter your employee ID"
              [disabled]="isLoading()"
            />
            <p
              id="employeeId-error"
              *ngIf="isFieldInvalid('employeeId')"
              class="mt-1 text-xs text-red-600 font-medium"
            >
              Employee ID is required
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-[#7c5a45]">
              Password
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              aria-label="Password"
              aria-describedby="password-error"
              [class.border-red-500]="isFieldInvalid('password')"
              class="mt-2 w-full rounded-lg border border-[#e5ddd5] bg-[#f9f7f5] px-4 py-3 text-sm text-[#1f2937] transition placeholder-[#9ca3af] focus:border-[#d39c78] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d39c78] focus:ring-opacity-20"
              placeholder="Enter your password"
              [disabled]="isLoading()"
            />
            <p
              id="password-error"
              *ngIf="isFieldInvalid('password')"
              class="mt-1 text-xs text-red-600 font-medium"
            >
              Password is required
            </p>
          </div>

          <!-- Error Message -->
          <div
            *ngIf="error()"
            class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            <div class="font-medium">Login Failed</div>
            <div class="text-xs mt-1">{{ error() }}</div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="form.invalid || isLoading()"
            class="relative mt-6 w-full rounded-lg bg-gradient-to-r from-[#9a562d] to-[#7a4620] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:from-[#824923] hover:enabled:to-[#6a3a1a] active:enabled:scale-95"
          >
            <span *ngIf="!isLoading()" class="flex items-center justify-center gap-2">
              <span>Sign In</span>
            </span>
            <span *ngIf="isLoading()" class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2" stroke-opacity="0.2"></circle>
                <path d="M12 2a10 10 0 0110 10" stroke-width="2" stroke-linecap="round"></path>
              </svg>
              <span>Signing in...</span>
            </span>
          </button>
        </form>

        <!-- Demo Credentials Note -->
        <div class="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p class="text-xs font-semibold text-blue-900 mb-2">Demo Credentials</p>
          <div class="space-y-1 text-xs text-blue-800">
            <div><strong>Admin:</strong> ADMIN001 / password123</div>
            <div><strong>Employee:</strong> EMP001 / password123</div>
          </div>
        </div>

        <!-- Footer -->
        <p class="mt-6 text-center text-xs text-[#6b7280]">
          ⓘ For support, contact your system administrator
        </p>
      </div>
    </section>
  `
})
export class LoginComponent {
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly form = this.fb.group({
    employeeId: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly authApi: AuthApiService,
    private readonly sessionService: SessionService,
    private readonly toastService: ToastService,
    private readonly router: Router
  ) {}

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.toastService.show('Please fill in all required fields', 'error');
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    const employeeId = (this.form.value.employeeId ?? '').trim().toUpperCase();
    const password = (this.form.value.password ?? '').trim();

    this.doLogin(employeeId, password);
  }

  private doLogin(employeeId: string, password: string): void {
    this.isLoading.set(true);
    const payload = { employeeId, password };

    this.authApi.login(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.sessionService.setFromLogin(response);
        this.toastService.show(`Welcome, ${response.name}!`, 'success');
        this.form.reset();

        const dashboard = (response.role ?? '').toUpperCase() === 'ADMIN'
          ? '/admin/dashboard'
          : '/employee/dashboard';
        this.router.navigateByUrl(dashboard);
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err?.error?.message ?? 'Invalid credentials. Please try again.';
        this.error.set(message);
        this.toastService.show(message, 'error');
      }
    });
  }
}
