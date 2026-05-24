<?php
namespace App\Services;

use App\Helpers\ApiException;
use App\Helpers\Env;
use App\Repositories\UserRepository;
use Firebase\JWT\JWT;

class AuthService
{
    public function __construct(private UserRepository $users)
    {
    }

    public function register(array $input): array
    {
        $name = trim((string) ($input['name'] ?? ''));
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $password = (string) ($input['password'] ?? '');
        $role = (string) ($input['role'] ?? 'passenger');

        if ($name === '' || $email === '' || $password === '') {
            throw new ApiException('name, email and password are required', 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ApiException('Invalid email format', 422);
        }

        if ($this->users->findByEmail($email) !== null) {
            throw new ApiException('Email already registered', 409);
        }

        if (!in_array($role, ['passenger', 'driver'], true)) {
            $role = 'passenger';
        }

        $userId = $this->users->create([
            'name' => $name,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_BCRYPT),
            'role' => $role,
            'status' => 'active',
        ]);

        $user = $this->users->find($userId);
        if ($user === null) {
            throw new ApiException('Unable to create user', 500);
        }

        return [
            'user' => $this->sanitizeUser($user),
            'token' => $this->issueToken($user),
        ];
    }

    public function login(array $input): array
    {
        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $password = (string) ($input['password'] ?? '');

        if ($email === '' || $password === '') {
            throw new ApiException('email and password are required', 422);
        }

        $user = $this->users->findByEmail($email);
        if ($user === null || !password_verify($password, $user['password'])) {
            throw new ApiException('Invalid credentials', 401);
        }

        return [
            'user' => $this->sanitizeUser($user),
            'token' => $this->issueToken($user),
        ];
    }

    private function issueToken(array $user): string
    {
        $now = time();
        $payload = [
            'iat' => $now,
            'iss' => Env::get('JWT_ISSUER', 'caronaao'),
            'aud' => Env::get('JWT_AUD', 'caronaao_clients'),
            'nbf' => $now,
            'exp' => $now + 3600,
            'sub' => (int) $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];

        return JWT::encode($payload, Env::get('JWT_SECRET', 'change_me'), 'HS256');
    }

    private function sanitizeUser(array $user): array
    {
        unset($user['password'], $user['deleted_at']);
        return $user;
    }
}