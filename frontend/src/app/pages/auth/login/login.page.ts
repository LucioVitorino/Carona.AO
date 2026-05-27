import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/services/auth.service';
import { userFeedback } from '../../../core/utils/user-feedback';
import { AlertMessageComponent } from '../../../shared/components/auth/alert-message.component';
import { AuthCardComponent } from '../../../shared/components/auth/auth-card.component';
import { LoadingButtonComponent } from '../../../shared/components/auth/loading-button.component';
import { PasswordInputComponent } from '../../../shared/components/auth/password-input.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgFor,
    NgIf,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    AuthCardComponent,
    AlertMessageComponent,
    PasswordInputComponent,
    LoadingButtonComponent,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  readonly form = this.fb.nonNullable.group({
    email: ['admin@caronaao.local', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]],
    rememberSession: [true],
  });

  loading = false;
  error = '';
  successMessage = '';
  readonly points = [
    { title: 'Rápido', description: 'Entre e continue a sua viagem sem complicação.' },
    { title: 'Seguro', description: 'A sua conta fica protegida durante a sessão.' },
    { title: 'Simples', description: 'Mensagens claras para saber sempre o que fazer.' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') ?? this.auth.getDashboardUrl());
      return;
    }

    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.successMessage = 'Conta criada. Entre para começar a usar o Carona.AO.';
    }

    if (this.route.snapshot.queryParamMap.get('reset') === '1') {
      this.successMessage = 'Senha alterada. Já pode entrar com a nova senha.';
    }
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password, rememberSession } = this.form.getRawValue();
    this.auth.login(email, password, Boolean(rememberSession)).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') ?? this.auth.getDashboardUrl());
      },
      error: (response) => {
        this.loading = false;
        this.error = userFeedback(response, 'Não conseguimos entrar na sua conta agora. Tente novamente.');
      },
    });
  }
}
