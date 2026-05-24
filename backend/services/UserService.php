<?php
namespace App\Services;

use App\Helpers\ApiException;
use App\Repositories\UserRepository;

class UserService
{
    public function __construct(private UserRepository $users)
    {
    }

    public function list(array $query): array
    {
        $limit = $this->resolveLimit($query['limit'] ?? 20);
        $offset = $this->resolveOffset($query['offset'] ?? 0);
        $filters = [
            'role' => $query['role'] ?? null,
            'status' => $query['status'] ?? null,
        ];

        $items = array_map([$this, 'sanitizeUser'], $this->users->all($filters, $limit, $offset));
        $total = $this->users->count($filters);

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
        $user = $this->users->find($id);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        return $this->sanitizeUser($user);
    }

    public function updateProfile(int $id, array $input): array
    {
        $payload = [];

        foreach (['name', 'photo', 'phone'] as $field) {
            if (array_key_exists($field, $input)) {
                $payload[$field] = $input[$field];
            }
        }

        if (array_key_exists('password', $input) && trim((string) $input['password']) !== '') {
            $payload['password'] = password_hash((string) $input['password'], PASSWORD_BCRYPT);
        }

        if ($payload === []) {
            throw new ApiException('No valid fields provided', 422);
        }

        if (!$this->users->update($id, $payload)) {
            throw new ApiException('Unable to update user', 400);
        }

        $user = $this->users->find($id);
        if ($user === null) {
            throw new ApiException('User not found', 404);
        }

        return $this->sanitizeUser($user);
    }

    public function remove(int $id): void
    {
        if (!$this->users->delete($id)) {
            throw new ApiException('Unable to delete user', 400);
        }
    }

    private function sanitizeUser(array $user): array
    {
        unset($user['password'], $user['deleted_at']);
        return $user;
    }

    private function resolveLimit(mixed $value): int
    {
        $limit = (int) $value;
        return max(1, min(100, $limit > 0 ? $limit : 20));
    }

    private function resolveOffset(mixed $value): int
    {
        $offset = (int) $value;
        return max(0, $offset);
    }
}