<?php
namespace App\Repositories;

use PDO;

abstract class BaseRepository
{
    protected PDO $pdo;
    protected string $table = '';
    protected string $primaryKey = 'id';
    protected array $fillable = [];
    protected bool $softDelete = false;
    protected string $deletedColumn = 'deleted_at';

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function find(int $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE {$this->primaryKey} = :id";
        if ($this->softDelete) {
            $sql .= " AND {$this->deletedColumn} IS NULL";
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }

    public function all(array $filters = [], int $limit = 50, int $offset = 0): array
    {
        [$where, $params] = $this->buildWhere($filters);
        $sql = "SELECT * FROM {$this->table}{$where} ORDER BY {$this->primaryKey} DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->pdo->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    public function count(array $filters = []): int
    {
        [$where, $params] = $this->buildWhere($filters);
        $stmt = $this->pdo->prepare("SELECT COUNT(*) AS total FROM {$this->table}{$where}");
        foreach ($params as $key => $value) {
            $stmt->bindValue(':' . $key, $value);
        }
        $stmt->execute();

        return (int) ($stmt->fetch()['total'] ?? 0);
    }

    public function create(array $data): int
    {
        $payload = $this->filterData($data);
        if ($payload === []) {
            return 0;
        }

        $columns = array_keys($payload);
        $placeholders = array_map(static fn (string $column): string => ':' . $column, $columns);

        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            $this->table,
            implode(', ', $columns),
            implode(', ', $placeholders)
        );

        $stmt = $this->pdo->prepare($sql);
        foreach ($payload as $column => $value) {
            $stmt->bindValue(':' . $column, $value);
        }
        $stmt->execute();

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $payload = $this->filterData($data);
        if ($payload === []) {
            return false;
        }

        $sets = [];
        foreach ($payload as $column => $value) {
            $sets[] = $column . ' = :' . $column;
        }

        $sql = sprintf(
            'UPDATE %s SET %s WHERE %s = :id',
            $this->table,
            implode(', ', $sets),
            $this->primaryKey
        );
        if ($this->softDelete) {
            $sql .= ' AND ' . $this->deletedColumn . ' IS NULL';
        }

        $stmt = $this->pdo->prepare($sql);
        foreach ($payload as $column => $value) {
            $stmt->bindValue(':' . $column, $value);
        }
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        if ($this->softDelete) {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET {$this->deletedColumn} = NOW() WHERE {$this->primaryKey} = :id AND {$this->deletedColumn} IS NULL");
        } else {
            $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE {$this->primaryKey} = :id");
        }

        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    protected function filterData(array $data): array
    {
        $payload = [];
        foreach ($this->fillable as $column) {
            if (array_key_exists($column, $data)) {
                $payload[$column] = $data[$column];
            }
        }

        return $payload;
    }

    protected function buildWhere(array $filters): array
    {
        $conditions = [];
        $params = [];

        foreach ($filters as $column => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $conditions[] = $column . ' = :' . $column;
            $params[$column] = $value;
        }

        if ($this->softDelete) {
            $conditions[] = $this->deletedColumn . ' IS NULL';
        }

        $where = $conditions === [] ? '' : ' WHERE ' . implode(' AND ', $conditions);
        return [$where, $params];
    }
}