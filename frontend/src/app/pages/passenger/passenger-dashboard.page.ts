import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { LocationPoint, Reservation, Ride } from '../../core/models/mobility.models';
import { MobilityService } from '../../core/services/mobility.service';
import { userFeedback } from '../../core/utils/user-feedback';
import { LeafletMapComponent, MapMarker } from '../../shared/components/leaflet-map.component';

@Component({
  selector: 'app-passenger-dashboard-page',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule, LeafletMapComponent],
  templateUrl: './passenger-dashboard.page.html',
  styleUrl: './passenger-dashboard.page.scss',
})
export class PassengerDashboardPage implements OnInit {
  rides: Ride[] = [];
  drivers: LocationPoint[] = [];
  reservations: Reservation[] = [];
  currentReservation: Reservation | null = null;
  markers: MapMarker[] = [];
  loading = true;
  reservingRideId: number | null = null;
  feedback = '';
  error = '';

  constructor(private readonly mobility: MobilityService) {}

  ngOnInit(): void {
    this.loadPassengerData();
  }

  loadPassengerData(): void {
    this.loading = true;
    this.error = '';

    this.mobility.listRides({ status: 'scheduled', available_only: 1 }).subscribe({
      next: (response) => {
        this.rides = response.items;
        this.loading = false;
        this.updateMarkers();
      },
      error: (response) => {
        this.loading = false;
        this.error = userFeedback(response, 'Não conseguimos carregar as caronas agora.');
      },
    });

    this.mobility.nearbyDrivers().subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.updateMarkers();
      },
    });

    this.mobility.myReservations().subscribe({
      next: (response) => {
        this.reservations = response.items;
        this.currentReservation = this.reservations[0] ?? null;
      },
    });
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.error = 'O seu navegador não permite usar localização.';
      return;
    }

    this.feedback = '';
    this.error = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.mobility.updateMyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }).subscribe({
          next: () => {
            this.feedback = 'Localização atualizada. Agora fica mais fácil encontrar caronas próximas.';
            this.markers = [
              ...this.markers,
              {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                label: 'Você está aqui',
                kind: 'passenger',
              },
            ];
          },
          error: (response) => {
            this.error = userFeedback(response, 'Não conseguimos guardar a sua localização.');
          },
        });
      },
      (geoError) => {
        if (geoError?.code === 1) {
          this.error = 'Ative a permissão de localização no navegador para ficar visível aos passageiros.';
          return;
        }

        this.error = 'Não foi possível obter a sua localização agora. Tente novamente.';
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  reserve(ride: Ride): void {
    this.reservingRideId = Number(ride.id);
    this.feedback = '';
    this.error = '';

    this.mobility.reserveRide(Number(ride.id), 1).subscribe({
      next: () => {
        this.reservingRideId = null;
        this.feedback = `Lugar reservado para ${ride.origin_address} -> ${ride.destination_address}.`;
        this.loadPassengerData();
      },
      error: (response) => {
        this.reservingRideId = null;
        this.error = userFeedback(response, 'Não foi possível reservar esta carona.');
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

  private updateMarkers(): void {
    const driverMarkers = this.drivers
      .filter((driver) => Number(driver.latitude) && Number(driver.longitude))
      .map((driver) => ({
        lat: Number(driver.latitude),
        lng: Number(driver.longitude),
        label: driver.name ? `${driver.name} disponível` : 'Motorista disponível',
        kind: 'driver' as const,
      }));

    const rideMarkers = this.rides.flatMap((ride) => {
      const points: MapMarker[] = [];
      if (ride.origin_lat && ride.origin_lng) {
        points.push({
          lat: Number(ride.origin_lat),
          lng: Number(ride.origin_lng),
          label: `Partida: ${ride.origin_address}`,
          kind: 'origin',
        });
      }
      if (ride.destination_lat && ride.destination_lng) {
        points.push({
          lat: Number(ride.destination_lat),
          lng: Number(ride.destination_lng),
          label: `Destino: ${ride.destination_address}`,
          kind: 'destination',
        });
      }
      return points;
    });

    this.markers = [...driverMarkers, ...rideMarkers];
  }

  get registeredRideTitle(): string {
    if (!this.currentReservation) {
      return 'Sem carona activa';
    }

    return `${this.currentReservation.origin_address ?? 'Origem'} -> ${this.currentReservation.destination_address ?? 'Destino'}`;
  }
}
