export interface Ride {
  id: number;
  driver_id: number;
  vehicle_id?: number | null;
  origin_address: string;
  origin_lat?: string | number | null;
  origin_lng?: string | number | null;
  destination_address: string;
  destination_lat?: string | number | null;
  destination_lng?: string | number | null;
  departure_time: string;
  total_price?: string | number;
  price: string | number;
  available_seats: string | number;
  notes?: string | null;
  status: string;
  driver_name?: string;
  driver_photo?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_plate?: string | null;
}

export interface Reservation {
  id: number;
  ride_id: number;
  passenger_id: number;
  seats: number;
  status: string;
  reserved_at: string;
  origin_address?: string;
  destination_address?: string;
  departure_time?: string;
  ride_status?: string;
  driver_name?: string;
  passenger_name?: string;
  passenger_phone?: string | null;
}

export interface LocationPoint {
  user_id: number;
  ride_id?: number | null;
  latitude: string | number;
  longitude: string | number;
  accuracy?: string | number | null;
  heading?: string | number | null;
  speed?: string | number | null;
  is_active?: string | number;
  updated_at?: string;
  name?: string;
  role?: 'driver' | 'passenger' | 'admin';
  photo?: string | null;
  phone?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_plate?: string | null;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}
