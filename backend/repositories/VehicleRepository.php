<?php
namespace App\Repositories;

class VehicleRepository extends BaseRepository
{
    protected string $table = 'vehicles';
    protected bool $softDelete = true;
    protected array $fillable = ['driver_id', 'brand', 'model', 'plate', 'color', 'seats', 'status'];

    public function findByPlate(string $plate): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM vehicles WHERE plate = :plate AND deleted_at IS NULL LIMIT 1');
        $stmt->execute(['plate' => $plate]);
        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }

    public function findByDriver(int $driverId, int $limit = 50, int $offset = 0): array
    {
        return $this->all(['driver_id' => $driverId], $limit, $offset);
    }
}