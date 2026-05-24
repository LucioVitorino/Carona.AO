<?php
namespace App\Repositories;

class UserRepository extends BaseRepository
{
    protected string $table = 'users';
    protected bool $softDelete = true;
    protected array $fillable = ['name', 'email', 'password', 'role', 'photo', 'phone', 'status', 'email_verified_at'];

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = :email AND deleted_at IS NULL LIMIT 1');
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch();

        return $row === false ? null : $row;
    }
}