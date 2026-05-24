<?php
namespace App\Services;

use App\Helpers\ApiException;
use App\Repositories\VehicleRepository;

class VehicleService
{
    public function __construct(private VehicleRepository $vehicles)
    {
    }

    public function list(array $query, array $actor): array
    {
        $limit = max(1, min(100, (int) ($query['limit'] ?? 20)));
        $offset = max(0, (int) ($query['offset'] ?? 0));

        if (($actor['role'] ?? 'passenger') === 'admin') {
            $items = $this->vehicles->all([], $limit, $offset);
            $total = $this->vehicles->count();
        } elseif (($actor['role'] ?? '') === 'driver') {
            $driverId = (int) $actor['sub'];
            $items = $this->vehicles->findByDriver($driverId, $limit, $offset);
            $total = $this->vehicles->count(['driver_id' => $driverId]);
        } else {
            $items = $this->vehicles->all(['status' => 'active'], $limit, $offset);
            $total = $this->vehicles->count(['status' => 'active']);
        }

        return [
            'items' => $items,
            'meta' => [
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
            ],
        ];
    }

    public function show(int $id): array
    {
        $vehicle = $this->vehicles->find($id);
        if ($vehicle === null) {
            throw new ApiException('Vehicle not found', 404);
        }

        return $vehicle;
    }

    public function create(array $input, array $actor): array
    {
        $driverId = (int) ($actor['sub'] ?? 0);
        if ($driverId <= 0) {
            throw new ApiException('Unauthorized', 401);
        }

        if (($actor['role'] ?? '') !== 'driver' && ($actor['role'] ?? '') !== 'admin') {
            throw new ApiException('Only drivers can create vehicles', 403);
        }

        $brand = trim((string) ($input['brand'] ?? ''));
        $model = trim((string) ($input['model'] ?? ''));
        $plate = strtoupper(trim((string) ($input['plate'] ?? '')));

        if ($brand === '' || $model === '' || $plate === '') {
            throw new ApiException('brand, model and plate are required', 422);
        }

        if ($this->vehicles->findByPlate($plate) !== null) {
            throw new ApiException('Plate already registered', 409);
        }

        $id = $this->vehicles->create([
            'driver_id' => $driverId,
            'brand' => $brand,
            'model' => $model,
            'plate' => $plate,
            'color' => $input['color'] ?? null,
            'seats' => (int) ($input['seats'] ?? 4),
            'status' => $input['status'] ?? 'active',
        ]);

        return $this->show($id);
    }

    public function update(int $id, array $input, array $actor): array
    {
        $vehicle = $this->vehicles->find($id);
        if ($vehicle === null) {
            throw new ApiException('Vehicle not found', 404);
        }

        $this->assertOwnership($vehicle, $actor);

        $payload = array_intersect_key($input, array_flip(['brand', 'model', 'plate', 'color', 'seats', 'status']));
        if (isset($payload['plate'])) {
            $payload['plate'] = strtoupper(trim((string) $payload['plate']));
        }

        if ($payload === []) {
            throw new ApiException('No valid fields provided', 422);
        }

        if (!$this->vehicles->update($id, $payload)) {
            throw new ApiException('Unable to update vehicle', 400);
        }

        return $this->show($id);
    }

    public function delete(int $id, array $actor): void
    {
        $vehicle = $this->vehicles->find($id);
        if ($vehicle === null) {
            throw new ApiException('Vehicle not found', 404);
        }

        $this->assertOwnership($vehicle, $actor);

        if (!$this->vehicles->delete($id)) {
            throw new ApiException('Unable to delete vehicle', 400);
        }
    }

    private function assertOwnership(array $vehicle, array $actor): void
    {
        if (($actor['role'] ?? '') === 'admin') {
            return;
        }

        if ((int) ($vehicle['driver_id'] ?? 0) !== (int) ($actor['sub'] ?? 0)) {
            throw new ApiException('Forbidden', 403);
        }
    }
}