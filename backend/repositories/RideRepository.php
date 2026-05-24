<?php
namespace App\Repositories;

class RideRepository extends BaseRepository
{
    protected string $table = 'rides';
    protected bool $softDelete = true;
    protected array $fillable = [
        'driver_id', 'vehicle_id', 'origin_address', 'origin_lat', 'origin_lng',
        'destination_address', 'destination_lat', 'destination_lng', 'departure_time',
        'price', 'available_seats', 'notes', 'status'
    ];

    public function search(array $filters = [], int $limit = 50, int $offset = 0): array
    {
        $conditions = ['r.deleted_at IS NULL'];
        $params = [];

        if (!empty($filters['status'])) {
            $conditions[] = 'r.status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['driver_id'])) {
            $conditions[] = 'r.driver_id = :driver_id';
            $params['driver_id'] = $filters['driver_id'];
        }

        if (!empty($filters['origin'])) {
            $conditions[] = 'r.origin_address LIKE :origin';
            $params['origin'] = '%' . $filters['origin'] . '%';
        }

        if (!empty($filters['destination'])) {
            $conditions[] = 'r.destination_address LIKE :destination';
            $params['destination'] = '%' . $filters['destination'] . '%';
        }

        if (!empty($filters['available_only'])) {
            $conditions[] = 'r.available_seats > 0';
        }

        $sql = '
            SELECT
                r.*,
                u.name AS driver_name,
                u.photo AS driver_photo,
                v.brand AS vehicle_brand,
                v.model AS vehicle_model,
                v.plate AS vehicle_plate
            FROM rides r
            INNER JOIN users u ON u.id = r.driver_id
            LEFT JOIN vehicles v ON v.id = r.vehicle_id
            WHERE ' . implode(' AND ', $conditions) . '
            ORDER BY r.departure_time ASC
            LIMIT :limit OFFSET :offset';

        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function countSearch(array $filters = []): int
    {
        $conditions = ['deleted_at IS NULL'];
        $params = [];

        if (!empty($filters['status'])) {
            $conditions[] = 'status = :status';
            $params['status'] = $filters['status'];
        }

        if (!empty($filters['driver_id'])) {
            $conditions[] = 'driver_id = :driver_id';
            $params['driver_id'] = $filters['driver_id'];
        }

        if (!empty($filters['origin'])) {
            $conditions[] = 'origin_address LIKE :origin';
            $params['origin'] = '%' . $filters['origin'] . '%';
        }

        if (!empty($filters['destination'])) {
            $conditions[] = 'destination_address LIKE :destination';
            $params['destination'] = '%' . $filters['destination'] . '%';
        }

        if (!empty($filters['available_only'])) {
            $conditions[] = 'available_seats > 0';
        }

        $sql = 'SELECT COUNT(*) AS total FROM rides WHERE ' . implode(' AND ', $conditions);
        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();

        return (int) ($stmt->fetch()['total'] ?? 0);
    }

    public function findWithRelations(int $id): ?array
    {
        $sql = '
            SELECT
                r.*,
                u.name AS driver_name,
                u.email AS driver_email,
                u.photo AS driver_photo,
                v.brand AS vehicle_brand,
                v.model AS vehicle_model,
                v.plate AS vehicle_plate
            FROM rides r
            INNER JOIN users u ON u.id = r.driver_id
            LEFT JOIN vehicles v ON v.id = r.vehicle_id
            WHERE r.id = :id AND r.deleted_at IS NULL
            LIMIT 1';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }
}