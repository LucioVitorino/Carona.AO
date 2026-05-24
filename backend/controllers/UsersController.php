<?php
namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Request;
use App\Middlewares\AuthMiddleware;
use App\Repositories\UserRepository;
use App\Services\UserService;

class UsersController extends BaseController
{
    private UserService $service;

    public function __construct()
    {
        $this->service = new UserService(new UserRepository(Database::getConnection()));
    }

    public function index(array $params = []): void
    {
        $this->respond(function () {
            AuthMiddleware::guard();
            $actor = $this->actor();
            if (($actor['role'] ?? '') !== 'admin') {
                throw new \App\Helpers\ApiException('Forbidden', 403);
            }

            return $this->service->list(Request::all());
        });
    }

    public function me(array $params = []): void
    {
        $this->respond(function () {
            AuthMiddleware::guard();
            $actor = $this->actor();
            return $this->service->show((int) ($actor['sub'] ?? 0));
        });
    }

    public function show(array $params = []): void
    {
        $this->respond(function () use ($params) {
            AuthMiddleware::guard();
            $actor = $this->actor();
            $id = (int) ($params['id'] ?? 0);

            if (($actor['role'] ?? '') !== 'admin' && (int) ($actor['sub'] ?? 0) !== $id) {
                throw new \App\Helpers\ApiException('Forbidden', 403);
            }

            return $this->service->show($id);
        });
    }

    public function updateMe(array $params = []): void
    {
        $this->respond(function () {
            AuthMiddleware::guard();
            $actor = $this->actor();
            return $this->service->updateProfile((int) ($actor['sub'] ?? 0), Request::json());
        });
    }

    public function destroy(array $params = []): void
    {
        $this->respond(function () use ($params) {
            AuthMiddleware::guard();
            $actor = $this->actor();
            if (($actor['role'] ?? '') !== 'admin') {
                throw new \App\Helpers\ApiException('Forbidden', 403);
            }

            $this->service->remove((int) ($params['id'] ?? 0));
            return null;
        });
    }
}
