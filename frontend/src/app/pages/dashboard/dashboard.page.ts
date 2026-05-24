import { Component, OnInit } from '@angular/core';

import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage implements OnInit {
  loading = true;
  health = 'a validar';

  constructor(
    private readonly api: ApiService,
    public readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.api.get<{ success: boolean; data: { status: string } }>('/health').subscribe({
      next: (response) => {
        this.health = response.data.status;
        this.loading = false;
      },
      error: () => {
        this.health = 'indisponível';
        this.loading = false;
      },
    });
  }
}
