import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__logo">C</div>
        <div>
          <strong>Carona.AO</strong>
          <p>Base operacional</p>
        </div>
      </div>

      <nav class="sidebar__nav">
        <a routerLink="/" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/dashboard" routerLinkActive="is-active">Dashboard</a>
        <a routerLink="/login" routerLinkActive="is-active">Login</a>
      </nav>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {}
