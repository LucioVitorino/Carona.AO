import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/services/auth.service';
import { matchFieldsValidator, strongPasswordValidator } from '../../../core/utils/form.validators';
import { userFeedback } from '../../../core/utils/user-feedback';
import { AlertMessageComponent } from '../../../shared/components/auth/alert-message.component';
import { AuthCardComponent } from '../../../shared/components/auth/auth-card.component';
import { AuthLayoutComponent } from '../../../shared/components/auth/auth-layout.component';
import { LoadingButtonComponent } from '../../../shared/components/auth/loading-button.component';
import { PasswordInputComponent } from '../../../shared/components/auth/password-input.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    AuthLayoutComponent,
    AuthCardComponent,
    AlertMessageComponent,
    PasswordInputComponent,
    LoadingButtonComponent,
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage implements OnInit {
  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      role: ['passenger' as 'passenger' | 'driver'],
      password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]],
      photo: [''],
    },
    { validators: [matchFieldsValidator('password', 'confirmPassword')] },
  );

  loading = false;
  error = '';
  successMessage = '';
  photoPreview = '';
  readonly points = [
    {
      title: 'Perfil pronto',
      description: 'Escolha o tipo de utilizador e mantenha a conta alinhada ao papel na plataforma.',
    },
    {
      title: 'Password forte',
      description: 'Validação em tempo real com regras claras e confirmação obrigatória.',
    },
    {
      title: 'Base escalável',
      description: 'O fluxo já encaixa em JWT, rotas guardadas e perfis reutilizáveis.',
    },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard');
      return;
    }

    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.controls.email.setValue(email);
    }
  }

  onPhotoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = String(reader.result ?? '');
    };
    reader.readAsDataURL(file);
  }

  hasPasswordRequirement(rule: 'length' | 'upper' | 'lower' | 'number' | 'symbol'): boolean {
    const value = this.form.controls.password.value ?? '';
    switch (rule) {
      case 'length':
        return value.length >= 8;
      case 'upper':
        return /[A-Z]/.test(value);
      case 'lower':
        return /[a-z]/.test(value);
      case 'number':
        return /\d/.test(value);
      case 'symbol':
        return /[^A-Za-z0-9]/.test(value);
      default:
        return false;
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { confirmPassword, ...payload } = this.form.getRawValue();
    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login'], {
          queryParams: {
            registered: 1,
            email: payload.email,
          },
        });
      },
      error: (response) => {
        this.loading = false;
        this.error = userFeedback(response, 'Não conseguimos criar a conta agora. Tente novamente.');
      },
    });
  }
}
