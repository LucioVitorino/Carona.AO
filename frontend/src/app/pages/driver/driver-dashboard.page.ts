import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Reservation, Ride } from '../../core/models/mobility.models';
import { MobilityService } from '../../core/services/mobility.service';
import { userFeedback } from '../../core/utils/user-feedback';
import { LeafletMapComponent, MapMarker } from '../../shared/components/leaflet-map.component';

@Component({
  selector: 'app-driver-dashboard-page',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, LeafletMapComponent],
  templateUrl: './driver-dashboard.page.html',
  styleUrl: './driver-dashboard.page.scss',
})
export class DriverDashboardPage implements OnInit {
  readonly rideForm = this.fb.nonNullable.group({
    origin_address: ['Talatona, Luanda', [Validators.required]],
    destination_address: ['Mutamba, Luanda', [Validators.required]],
    departure_time: ['', [Validators.required]],
    available_seats: [4, [Validators.required, Validators.min(1), Validators.max(99)]],
    total_price: [12000, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  savingRide = false;
  publishingLocation = false;
  rideError = '';
  rideSuccess = '';
  locationFeedback = '';
  rides: Ride[] = [];
  reservations: Reservation[] = [];
  markers: MapMarker[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly mobility: MobilityService,
  ) {}

  ngOnInit(): void {
    this.loadMyRides();
    this.loadReservations();
  }

  get pricePerPassenger(): number {
    const seats = Number(this.rideForm.controls.available_seats.value) || 0;
    const total = Number(this.rideForm.controls.total_price.value) || 0;
    return seats > 0 ? Math.round((total / seats) * 100) / 100 : 0;
  }

  get totalAvailableSeats(): number {
    return this.rides.reduce((sum, ride) => sum + Number(ride.available_seats ?? 0), 0);
  }

  get totalReservedSeats(): number {
    return this.reservations.reduce((sum, reservation) => sum + Number(reservation.seats ?? 0), 0);
  }

  get activeTrips(): number {
    return this.rides.filter((ride) => ride.status === 'scheduled' || ride.status === 'ongoing').length;
  }

  get driverSummary() {
    return [
      { label: 'Caronas activas', value: String(this.activeTrips), icon: 'route' },
      { label: 'Lugares livres', value: String(this.totalAvailableSeats), icon: 'event_seat' },
      { label: 'Lugares reservados', value: String(this.totalReservedSeats), icon: 'people' },
    ];
  }

  reservedSeatsForRide(rideId: number): number {
    return this.reservations
      .filter((reservation) => Number(reservation.ride_id) === Number(rideId))
      .reduce((sum, reservation) => sum + Number(reservation.seats ?? 0), 0);
  }

  availableSeatsForRide(ride: Ride): number {
    return Math.max(0, Number(ride.available_seats ?? 0));
  }

  passengersForRide(rideId: number): string {
    const names = this.reservations
      .filter((reservation) => Number(reservation.ride_id) === Number(rideId))
      .map((reservation) => reservation.passenger_name || 'Passageiro');

    return names.length > 0 ? Array.from(new Set(names)).join(', ') : 'Sem reservas';
  }

  loadMyRides(): void {
    this.mobility.listRides({ limit: 20 }).subscribe({
      next: (response) => {
        this.rides = response.items;
        this.updateRideMarkers();
      },
      error: (response) => {
        this.rideError = userFeedback(response, 'Não conseguimos carregar as suas caronas.');
      },
    });
  }

  loadReservations(): void {
    this.mobility.driverReservations().subscribe({
      next: (response) => {
        this.reservations = response.items;
      },
    });
  }

  publishLocation(): void {
    if (!navigator.geolocation) {
      this.rideError = 'O seu navegador não permite usar localização.';
      return;
    }

    this.publishingLocation = true;
    this.locationFeedback = '';
    this.rideError = '';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.mobility.updateMyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          ride_id: this.rides[0]?.id ?? null,
        }).subscribe({
          next: () => {
            this.publishingLocation = false;
            this.locationFeedback = 'Localização publicada. Passageiros já podem ver que está online.';
            this.markers = [
              {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                label: 'A sua localização',
                kind: 'driver',
              },
              ...this.markers,
            ];
          },
          error: (response) => {
            this.publishingLocation = false;
            this.rideError = userFeedback(response, 'Não conseguimos publicar a sua localização.');
          },
        });
      },
      (geoError) => {
        this.publishingLocation = false;
        if (geoError?.code === 1) {
          this.rideError = 'Ative a permissão de localização no navegador para ficar visível aos passageiros.';
          return;
        }

        this.rideError = 'Não foi possível obter a sua localização agora. Tente novamente.';
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  createRide(): void {
    if (this.rideForm.invalid || this.savingRide) {
      this.rideForm.markAllAsTouched();
      this.rideError = 'Preencha os dados da carona antes de continuar.';
      return;
    }

    const payload = this.rideForm.getRawValue();
    this.savingRide = true;
    this.rideError = '';
    this.rideSuccess = '';

    this.mobility.createRide({
      ...payload,
      departure_time: this.normalizeDepartureTime(payload.departure_time),
      total_price: Number(payload.total_price),
      available_seats: Number(payload.available_seats),
      status: 'scheduled',
    }).subscribe({
      next: () => {
        this.savingRide = false;
        this.rideSuccess = `Carona criada. Cada passageiro pagará ${this.formatKwanza(this.pricePerPassenger)}.`;
        this.loadMyRides();
        this.loadReservations();
      },
      error: (response) => {
        this.savingRide = false;
        this.rideError = userFeedback(response, 'Não foi possível criar a carona. Tente novamente.');
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

  private normalizeDepartureTime(value: string): string {
    if (!value) {
      return value;
    }

    const normalized = value.replace('T', ' ');
    return normalized.length === 16 ? `${normalized}:00` : normalized;
  }

  private updateRideMarkers(): void {
    this.markers = this.rides.flatMap((ride) => {
      const markers: MapMarker[] = [];
      if (ride.origin_lat && ride.origin_lng) {
        markers.push({
          lat: Number(ride.origin_lat),
          lng: Number(ride.origin_lng),
          label: `Partida: ${ride.origin_address}`,
          kind: 'origin',
        });
      }
      if (ride.destination_lat && ride.destination_lng) {
        markers.push({
          lat: Number(ride.destination_lat),
          lng: Number(ride.destination_lng),
          label: `Destino: ${ride.destination_address}`,
          kind: 'destination',
        });
      }
      return markers;
    });
  }

}
