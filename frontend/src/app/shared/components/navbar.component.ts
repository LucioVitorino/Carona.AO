import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="navbar">
      <div>
        <p class="navbar__eyebrow">Carona.AO</p>
        <h1>Plataforma de caronas inteligentes</h1>
      </div>

      <a routerLink="/login" class="navbar__action">Entrar</a>
    </header>
  `,
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {}
