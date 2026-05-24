<?php
namespace App\Services;

use App\Helpers\ApiException;
use App\Repositories\RideRepository;

class RideService
{
    public function __construct(private RideRepository $rides)
    {
    }

    public function list(array $query, array $actor): array
    {
        $limit = max(1, min(100, (int) ($query['limit'] ?? 20)));
        $offset = max(0, (int) ($query['offset'] ?? 0));

        $filters = [
            'status' => $query['status'] ?? null,
            'driver_id' => $query['driver_id'] ?? null,
            'origin' => $query['origin'] ?? null,
            'destination' => $query['destination'] ?? null,
            'available_only' => $query['available_only'] ?? null,
        ];

        if (($actor['role'] ?? '') === 'driver') {
            $filters['driver_id'] = (int) ($actor['sub'] ?? 0);
        }

        $items = $this->rides->search($filters, $limit, $offset);
        $total = $this->rides->countSearch($filters);

        return [
            'items' => $items,
            'meta' => [
                'limit' => $limit,
                'offset' => $offset,
                'total' => $total,
            ],
        ];
    }

    public function show(int $id): array
    {
        $ride = $this->rides->findWithRelations($id);
        if ($ride === null) {
            throw new ApiException('Ride not found', 404);
        }

        return $ride;
    }

    public function create(array $input, array $actor): array
    {
        if (!in_array($actor['role'] ?? '', ['driver', 'admin'], true)) {
            throw new ApiException('Only drivers can create rides', 403);
        }

        $origin = trim((string) ($input['origin_address'] ?? ''));
        $destination = trim((string) ($input['destination_address'] ?? ''));
        $departureTime = trim((string) ($input['departure_time'] ?? ''));

        if ($origin === '' || $destination === '' || $departureTime === '') {
            throw new ApiException('origin_address, destination_address and departure_time are required', 422);
        }

        $id = $this->rides->create([
            'driver_id' => (int) ($actor['sub'] ?? 0),
            'vehicle_id' => $input['vehicle_id'] ?? null,
            'origin_address' => $origin,
            'origin_lat' => $input['origin_lat'] ?? null,
            'origin_lng' => $input['origin_lng'] ?? null,
            'destination_address' => $destination,
            'destination_lat' => $input['destination_lat'] ?? null,
            'destination_lng' => $input['destination_lng'] ?? null,
            'departure_time' => $departureTime,
            'price' => $input['price'] ?? 0,
            'available_seats' => $input['available_seats'] ?? 1,
            'notes' => $input['notes'] ?? null,
            'status' => $input['status'] ?? 'scheduled',
        ]);

        return $this->show($id);
    }

    public function update(int $id, array $input, array $actor): array
    {
        $ride = $this->rides->find($id);
        if ($ride === null) {
            throw new ApiException('Ride not found', 404);
        }

        $this->assertOwnership($ride, $actor);

        $payload = array_intersect_key($input, array_flip([
            'vehicle_id', 'origin_address', 'origin_lat', 'origin_lng', 'destination_address',
            'destination_lat', 'destination_lng', 'departure_time', 'price', 'available_seats', 'notes', 'status'
        ]));

        if ($payload === []) {
            throw new ApiException('No valid fields provided', 422);
        }

        if (!$this->rides->update($id, $payload)) {
            throw new ApiException('Unable to update ride', 400);
        }

        return $this->show($id);
    }

    public function delete(int $id, array $actor): void
    {
        $ride = $this->rides->find($id);
        if ($ride === null) {
            throw new ApiException('Ride not found', 404);
        }

        $this->assertOwnership($ride, $actor);

        if (!$this->rides->delete($id)) {
            throw new ApiException('Unable to delete ride', 400);
        }
    }

    public function start(int $id, array $actor): array
    {
        $ride = $this->rides->find($id);
        if ($ride === null) {
            throw new ApiException('Ride not found', 404);
        }

        $this->assertOwnership($ride, $actor);
        if (!$this->rides->update($id, ['status' => 'ongoing'])) {
            throw new ApiException('Unable to start ride', 400);
        }

        return $this->show($id);
    }

    public function finish(int $id, array $actor): array
    {
        $ride = $this->rides->find($id);
        if ($ride === null) {
            throw new ApiException('Ride not found', 404);
        }

        $this->assertOwnership($ride, $actor);
        if (!$this->rides->update($id, ['status' => 'completed'])) {
            throw new ApiException('Unable to finish ride', 400);
        }

        return $this->show($id);
    }

    private function assertOwnership(array $ride, array $actor): void
    {
        if (($actor['role'] ?? '') === 'admin') {
            return;
        }

        if ((int) ($ride['driver_id'] ?? 0) !== (int) ($actor['sub'] ?? 0)) {
            throw new ApiException('Forbidden', 403);
        }
    }
}