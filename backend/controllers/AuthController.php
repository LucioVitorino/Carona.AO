<?php
namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Request;
use App\Repositories\UserRepository;
use App\Services\AuthService;

class AuthController extends BaseController
{
    private AuthService $service;

    public function __construct()
    {
        $this->service = new AuthService(new UserRepository(Database::getConnection()));
    }

    public function login(array $params = []): void
    {
        $this->respond(function () {
            return $this->service->login(Request::json());
        });
    }

    public function register(array $params = []): void
    {
        $this->respond(function () {
            return $this->service->register(Request::json());
        });
    }
}
