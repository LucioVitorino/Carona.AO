import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, AuthLayoutComponent, AuthCardComponent, AlertMessageComponent, PasswordInputComponent, LoadingButtonComponent],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage implements OnInit {
  readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
      passwordConfirmation: ['', [Validators.required]],
    },
    { validators: [matchFieldsValidator('password', 'passwordConfirmation')] },
  );

  loading = false;
  error = '';
  successMessage = '';
  readonly points = [
    { title: 'Link protegido', description: 'A recuperação expira para manter a sua conta segura.' },
    { title: 'Senha nova', description: 'Depois de alterar, entre usando a nova senha.' },
    { title: 'Poucos passos', description: 'Preencha, confirme e volte ao Carona.AO.' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') ?? this.auth.getResetEmail();
    const token = this.route.snapshot.queryParamMap.get('token');

    if (email) {
      this.form.controls.email.setValue(email);
    }

    if (token) {
      this.form.controls.token.setValue(token);
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.resetPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.auth.clearResetEmail();
        this.router.navigate(['/login'], { queryParams: { reset: 1 } });
      },
      error: (response) => {
        this.loading = false;
        this.error = userFeedback(response, 'Não conseguimos alterar a senha agora. Tente novamente.');
      },
    });
  }
}
