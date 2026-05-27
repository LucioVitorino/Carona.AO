import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgIf, MatIconModule],
  template: `
    <header class="navbar">
      <button class="icon-button navbar__menu" type="button" (click)="menuClick.emit()" aria-label="Abrir menu">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="navbar__search">
        <mat-icon>search</mat-icon>
        <span>Pesquisar utilizadores, viagens ou reservas</span>
      </div>

      <div class="navbar__actions">
        <button class="icon-button" type="button" (click)="themeClick.emit()" aria-label="Alternar tema">
          <mat-icon>{{ lightMode ? 'dark_mode' : 'light_mode' }}</mat-icon>
        </button>

        <button class="icon-button" type="button" aria-label="Notificações">
          <mat-icon>notifications_none</mat-icon>
        </button>

        <ng-container *ngIf="auth.user(); else guestActions">
          <a [routerLink]="auth.getDashboardUrl()" class="navbar__profile">
            <span class="avatar">{{ initials(auth.user()?.name) }}</span>
            <span>{{ auth.user()?.name }}</span>
          </a>
          <button type="button" class="btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Sair
          </button>
        </ng-container>

        <ng-template #guestActions>
          <a routerLink="/register" class="btn">Criar conta</a>
          <a routerLink="/login" class="btn btn--primary">Entrar</a>
        </ng-template>
      </div>
    </header>
  `,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Input() lightMode = false;
  @Output() readonly menuClick = new EventEmitter<void>();
  @Output() readonly themeClick = new EventEmitter<void>();

  readonly auth = inject(AuthService);

  constructor(private readonly router: Router) {}

  initials(name = ''): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
