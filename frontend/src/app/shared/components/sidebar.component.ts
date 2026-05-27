import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth.service';

interface SidebarLink {
  label: string;
  icon: string;
  route: string;
  fragment?: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, MatIconModule],
  template: `
    <aside class="sidebar">
      <a class="sidebar__brand" routerLink="/" (click)="navigate.emit()">
        <div class="sidebar__logo">C</div>
        <div>
          <strong>Carona.AO</strong>
          <p>Mobility OS</p>
        </div>
      </a>

      <div class="sidebar__workspace" *ngIf="auth.user() as user">
        <span>{{ roleLabel(user.role) }}</span>
        <strong>{{ user.name }}</strong>
      </div>

      <nav class="sidebar__nav" aria-label="Navegação principal">
        <a
          *ngFor="let item of links()"
          [routerLink]="item.route"
          [fragment]="item.fragment"
          routerLinkActive="is-active"
          [routerLinkActiveOptions]="{ exact: item.route === '/' }"
          (click)="navigate.emit()"
        >
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar__ops">
        <p>Operação</p>
        <div><span class="dot"></span> API online</div>
        <div><span class="dot dot--blue"></span> Tracking preparado</div>
      </div>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Output() readonly navigate = new EventEmitter<void>();

  readonly auth = inject(AuthService);
  readonly baseLinks: SidebarLink[] = [
    { label: 'Home', icon: 'home', route: '/' },
    { label: 'Admin', icon: 'space_dashboard', route: '/admin', roles: ['admin'] },
    { label: 'Passageiro', icon: 'near_me', route: '/passageiro', roles: ['passenger', 'admin'] },
    { label: 'Nova carona', icon: 'add_road', route: '/motorista', fragment: 'nova-carona', roles: ['driver', 'admin'] },
    { label: 'Motorista', icon: 'local_taxi', route: '/motorista', roles: ['driver', 'admin'] },
  ];

  readonly links = computed(() => {
    const role = this.auth.user()?.role;
    if (!role) {
      return this.baseLinks.filter((item) => !item.roles);
    }

    return this.baseLinks.filter((item) => !item.roles || item.roles.includes(role));
  });

  roleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administração',
      passenger: 'Passageiro',
      driver: 'Motorista',
    };

    return labels[role] ?? role;
  }
}
