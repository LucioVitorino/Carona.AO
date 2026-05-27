import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    private readonly router: Router,
    public readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    const dashboardUrl = this.auth.getDashboardUrl();
    if (dashboardUrl !== '/login') {
      this.router.navigateByUrl(dashboardUrl);
      return;
    }

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
