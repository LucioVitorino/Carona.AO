import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { Ride } from '../../core/models/mobility.models';
import { MobilityService } from '../../core/services/mobility.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [NgFor, MatIconModule],
  templateUrl: './admin-dashboard.page.html',
  styleUrl: './admin-dashboard.page.scss',
})
export class AdminDashboardPage implements OnInit {
  rides: Ride[] = [];
  totalRides = 0;

  readonly stats = [
    { label: 'Receita mensal', value: '4.8M Kz', icon: 'payments' },
    { label: 'Caronas na API', value: '0', icon: 'route' },
    { label: 'Motoristas ativos', value: '1.248', icon: 'local_taxi' },
    { label: 'Denúncias abertas', value: '23', icon: 'report' },
  ];

  constructor(private readonly mobility: MobilityService) {}

  ngOnInit(): void {
    this.loadRides();
  }

  loadRides(): void {
    this.mobility.listRides({ limit: 10 }).subscribe({
      next: (response) => {
        this.rides = response.items;
        this.totalRides = response.meta.total;
        this.stats[1].value = String(response.meta.total);
      },
    });
  }

  formatKwanza(value: string | number | undefined): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
  }
}
