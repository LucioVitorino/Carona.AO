<?php
namespace App\Repositories;

class ReservationRepository extends BaseRepository
{
    protected string $table = 'reservations';
    protected array $fillable = ['ride_id', 'passenger_id', 'seats', 'status', 'reserved_at', 'cancelled_at'];

    public function findByRideAndPassenger(int $rideId, int $passengerId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM reservations WHERE ride_id = :ride_id AND passenger_id = :passenger_id LIMIT 1');
        $stmt->execute([
            'ride_id' => $rideId,
            'passenger_id' => $passengerId,
        ]);
        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }

    public function listByPassenger(int $passengerId, int $limit = 50, int $offset = 0): array
    {
        $sql = '
            SELECT
                rsv.*,
                rd.origin_address,
                rd.destination_address,
                rd.departure_time,
                rd.status AS ride_status,
                u.name AS driver_name
            FROM reservations rsv
            INNER JOIN rides rd ON rd.id = rsv.ride_id
            INNER JOIN users u ON u.id = rd.driver_id
            WHERE rsv.passenger_id = :passenger_id
            ORDER BY rsv.id DESC
            LIMIT :limit OFFSET :offset';

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':passenger_id', $passengerId, \PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}