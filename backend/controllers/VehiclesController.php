<?php
namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Request;
use App\Middlewares\AuthMiddleware;
use App\Repositories\VehicleRepository;
use App\Services\VehicleService;

class VehiclesController extends BaseController
{
    private VehicleService $service;

    public function __construct()
    {
        $this->service = new VehicleService(new VehicleRepository(Database::getConnection()));
    }

    public function index(array $params = []): void
    {
        $this->respond(function () {
            return $this->service->list(Request::all(), $this->actor());
        });
    }

    public function show(array $params = []): void
    {
        $this->respond(function () use ($params) {
            return $this->service->show((int) ($params['id'] ?? 0));
        });
    }

    public function store(array $params = []): void
    {
        $this->respond(function () {
            AuthMiddleware::guard();
            return $this->service->create(Request::json(), $this->actor());
        });
    }

    public function update(array $params = []): void
    {
        $this->respond(function () use ($params) {
            AuthMiddleware::guard();
            return $this->service->update((int) ($params['id'] ?? 0), Request::json(), $this->actor());
        });
    }

    public function destroy(array $params = []): void
    {
        $this->respond(function () use ($params) {
            AuthMiddleware::guard();
            $this->service->delete((int) ($params['id'] ?? 0), $this->actor());
            return null;
        });
    }
}
