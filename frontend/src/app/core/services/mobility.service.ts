import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiEnvelope } from '../models/auth.models';
import { LocationPoint, Paginated, Reservation, Ride } from '../models/mobility.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MobilityService {
  constructor(private readonly api: ApiService) {}

  listRides(params: Record<string, string | number | boolean | null | undefined> = {}): Observable<Paginated<Ride>> {
    return this.api.get<ApiEnvelope<Ride[]> & { meta: Paginated<Ride>['meta'] }>(`/rides${this.query(params)}`).pipe(
      map((response) => ({
        items: response.data,
        meta: response.meta,
      })),
    );
  }

  createRide(payload: Partial<Ride> & { total_price: number; available_seats: number }): Observable<Ride> {
    return this.api.post<ApiEnvelope<Ride>>('/rides', payload).pipe(map((response) => response.data));
  }

  reserveRide(rideId: number, seats = 1): Observable<Reservation> {
    return this.api
      .post<ApiEnvelope<Reservation>>('/reservations', { ride_id: rideId, seats })
      .pipe(map((response) => response.data));
  }

  myReservations(): Observable<Paginated<Reservation>> {
    return this.api.get<ApiEnvelope<Reservation[]> & { meta: Paginated<Reservation>['meta'] }>('/reservations/me').pipe(
      map((response) => ({
        items: response.data,
        meta: response.meta,
      })),
    );
  }

  driverReservations(): Observable<Paginated<Reservation>> {
    return this.api.get<ApiEnvelope<Reservation[]> & { meta: Paginated<Reservation>['meta'] }>('/reservations/driver').pipe(
      map((response) => ({
        items: response.data,
        meta: response.meta,
      })),
    );
  }

  updateMyLocation(payload: Partial<LocationPoint>): Observable<LocationPoint> {
    return this.api.post<ApiEnvelope<LocationPoint>>('/locations/me', payload).pipe(map((response) => response.data));
  }

  nearbyDrivers(): Observable<LocationPoint[]> {
    return this.api.get<ApiEnvelope<LocationPoint[]>>('/locations/nearby').pipe(map((response) => response.data));
  }

  rideLocations(rideId: number): Observable<LocationPoint[]> {
    return this.api.get<ApiEnvelope<LocationPoint[]>>(`/locations/ride/${rideId}`).pipe(map((response) => response.data));
  }

  private query(params: Record<string, string | number | boolean | null | undefined>): string {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    });

    const value = search.toString();
    return value ? `?${value}` : '';
  }
}
