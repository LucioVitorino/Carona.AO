import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

export interface AuthLayoutPoint {
  title: string;
  description: string;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  @Input() eyebrow = 'Acesso seguro';
  @Input() title = 'Carona.AO';
  @Input() description = 'Autenticação moderna, responsiva e pronta para crescer.';
  @Input() points: AuthLayoutPoint[] = [];
}