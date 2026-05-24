<?php
namespace App\Services;

use App\Config\Database;
use App\Helpers\ApiException;
use App\Repositories\ReservationRepository;
use App\Repositories\RideRepository;
use PDO;

class ReservationService
{
    public function __construct(
        private ReservationRepository $reservations,
        private RideRepository $rides
    ) {
    }

    public function listMy(int $passengerId, array $query): array
    {
        $limit = max(1, min(100, (int) ($query['limit'] ?? 20)));
        $offset = max(0, (int) ($query['offset'] ?? 0));

        return [
            'items' => $this->reservations->listByPassenger($passengerId, $limit, $offset),
            'meta' => [
                'total' => $this->reservations->count(['passenger_id' => $passengerId]),
                'limit' => $limit,
                'offset' => $offset,
            ],
        ];
    }

    public function create(array $input, array $actor): array
    {
        if (($actor['role'] ?? '') !== 'passenger') {
            throw new ApiException('Only passengers can reserve rides', 403);
        }

        $rideId = (int) ($input['ride_id'] ?? 0);
        $seats = max(1, (int) ($input['seats'] ?? 1));

        if ($rideId <= 0) {
            throw new ApiException('ride_id is required', 422);
        }

        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            $ride = $this->rides->find($rideId);
            if ($ride === null) {
                throw new ApiException('Ride not found', 404);
            }

            if ((int) $ride['available_seats'] < $seats) {
                throw new ApiException('Not enough available seats', 409);
            }

            if ($this->reservations->findByRideAndPassenger($rideId, (int) $actor['sub']) !== null) {
                throw new ApiException('Reservation already exists for this ride', 409);
            }

            $reservationId = $this->reservations->create([
                'ride_id' => $rideId,
                'passenger_id' => (int) $actor['sub'],
                'seats' => $seats,
                'status' => 'confirmed',
                'reserved_at' => date('Y-m-d H:i:s'),
            ]);

            $this->rides->update($rideId, [
                'available_seats' => (int) $ride['available_seats'] - $seats,
            ]);

            $pdo->commit();

            return $this->find($reservationId);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            if ($e instanceof ApiException) {
                throw $e;
            }

            throw new ApiException('Unable to create reservation', 500);
        }
    }

    public function find(int $id): array
    {
        $reservation = $this->reservations->find($id);
        if ($reservation === null) {
            throw new ApiException('Reservation not found', 404);
        }

        return $reservation;
    }

    public function cancel(int $id, array $actor): array
    {
        $reservation = $this->reservations->find($id);
        if ($reservation === null) {
            throw new ApiException('Reservation not found', 404);
        }

        if (($actor['role'] ?? '') !== 'admin' && (int) ($reservation['passenger_id'] ?? 0) !== (int) ($actor['sub'] ?? 0)) {
            throw new ApiException('Forbidden', 403);
        }

        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            if (($reservation['status'] ?? '') !== 'cancelled') {
                $ride = $this->rides->find((int) $reservation['ride_id']);
                if ($ride !== null) {
                    $this->rides->update((int) $reservation['ride_id'], [
                        'available_seats' => ((int) $ride['available_seats']) + (int) $reservation['seats'],
                    ]);
                }

                $this->reservations->update($id, [
                    'status' => 'cancelled',
                    'cancelled_at' => date('Y-m-d H:i:s'),
                ]);
            }

            $pdo->commit();

            return $this->find($id);
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            if ($e instanceof ApiException) {
                throw $e;
            }

            throw new ApiException('Unable to cancel reservation', 500);
        }
    }
}