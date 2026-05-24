<?php
namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Request;
use App\Middlewares\AuthMiddleware;
use App\Repositories\ReservationRepository;
use App\Repositories\RideRepository;
use App\Services\ReservationService;

class ReservationsController extends BaseController
{
    private ReservationService $service;

    public function __construct()
    {
        $this->service = new ReservationService(
            new ReservationRepository(Database::getConnection()),
            new RideRepository(Database::getConnection())
        );
    }

    public function me(array $params = []): void
    {
        $this->respond(function () {
            AuthMiddleware::guard();
            $actor = $this->actor();
            return $this->service->listMy((int) ($actor['sub'] ?? 0), Request::all());
        });
    }

    public function store(array $params = []): void
    {
        $this->respond(function () {
            AuthMiddleware::guard();
            return $this->service->create(Request::json(), $this->actor());
        });
    }

    public function show(array $params = []): void
    {
        $this->respond(function () use ($params) {
            AuthMiddleware::guard();
            $reservation = $this->service->find((int) ($params['id'] ?? 0));
            $actor = $this->actor();

            if (($actor['role'] ?? '') !== 'admin' && (int) ($reservation['passenger_id'] ?? 0) !== (int) ($actor['sub'] ?? 0)) {
                throw new \App\Helpers\ApiException('Forbidden', 403);
            }

            return $reservation;
        });
    }

    public function cancel(array $params = []): void
    {
        $this->respond(function () use ($params) {
            AuthMiddleware::guard();
            return $this->service->cancel((int) ($params['id'] ?? 0), $this->actor());
        });
    }
}