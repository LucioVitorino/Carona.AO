import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/services/auth.service';
import { userFeedback } from '../../../core/utils/user-feedback';
import { AlertMessageComponent } from '../../../shared/components/auth/alert-message.component';
import { AuthCardComponent } from '../../../shared/components/auth/auth-card.component';
import { AuthLayoutComponent } from '../../../shared/components/auth/auth-layout.component';
import { LoadingButtonComponent } from '../../../shared/components/auth/loading-button.component';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, MatFormFieldModule, MatInputModule, AuthLayoutComponent, AuthCardComponent, AlertMessageComponent, LoadingButtonComponent],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage implements OnInit {
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  loading = false;
  error = '';
  successMessage = '';
  resetLink = '';
  readonly points = [
    { title: 'Sem stress', description: 'Informe o email e siga as instruções para voltar à conta.' },
    { title: 'Protegido', description: 'O link de recuperação vale apenas por tempo limitado.' },
    { title: 'Guiado', description: 'A página mostra claramente o próximo passo.' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email') ?? this.auth.getResetEmail();
    if (email) {
      this.form.controls.email.setValue(email);
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.auth.forgotPassword({ email: this.form.controls.email.value }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Se este email estiver cadastrado, enviámos as instruções de recuperação.';
        this.auth.storeResetEmail(response.email);
        if (response.resetUrl) {
          this.resetLink = response.resetUrl;
        }
        if (response.resetToken) {
          this.resetLink = response.resetUrl ?? this.router.serializeUrl(
            this.router.createUrlTree(['/reset-password'], {
              queryParams: {
                email: response.email,
                token: response.resetToken,
              },
            }),
          );
        }
      },
      error: (response) => {
        this.loading = false;
        this.error = userFeedback(response, 'Não conseguimos iniciar a recuperação agora. Tente novamente.');
      },
    });
  }
}
