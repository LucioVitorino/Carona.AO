<?php
use App\Controllers\AuthController;
use App\Helpers\Response;
use App\Controllers\UsersController;
use App\Controllers\VehiclesController;
use App\Controllers\RidesController;
use App\Controllers\ReservationsController;

// $router is provided by public/index.php
$router->add('GET', '/api/health', function () {
	Response::success(['status' => 'running'], 'Carona.AO backend is running');
});

$router->add('POST', '/api/auth/login', [AuthController::class, 'login']);
$router->add('POST', '/api/auth/register', [AuthController::class, 'register']);

$router->add('GET', '/api/users', [UsersController::class, 'index']);
$router->add('GET', '/api/users/me', [UsersController::class, 'me']);
$router->add('GET', '/api/users/{id}', [UsersController::class, 'show']);
$router->add('PUT', '/api/users/me', [UsersController::class, 'updateMe']);
$router->add('DELETE', '/api/users/{id}', [UsersController::class, 'destroy']);

$router->add('GET', '/api/vehicles', [VehiclesController::class, 'index']);
$router->add('GET', '/api/vehicles/{id}', [VehiclesController::class, 'show']);
$router->add('POST', '/api/vehicles', [VehiclesController::class, 'store']);
$router->add('PUT', '/api/vehicles/{id}', [VehiclesController::class, 'update']);
$router->add('DELETE', '/api/vehicles/{id}', [VehiclesController::class, 'destroy']);

$router->add('GET', '/api/rides', [RidesController::class, 'index']);
$router->add('GET', '/api/rides/{id}', [RidesController::class, 'show']);
$router->add('POST', '/api/rides', [RidesController::class, 'store']);
$router->add('PUT', '/api/rides/{id}', [RidesController::class, 'update']);
$router->add('DELETE', '/api/rides/{id}', [RidesController::class, 'destroy']);
$router->add('POST', '/api/rides/{id}/start', [RidesController::class, 'start']);
$router->add('POST', '/api/rides/{id}/finish', [RidesController::class, 'finish']);

$router->add('GET', '/api/reservations/me', [ReservationsController::class, 'me']);
$router->add('GET', '/api/reservations/{id}', [ReservationsController::class, 'show']);
$router->add('POST', '/api/reservations', [ReservationsController::class, 'store']);
$router->add('POST', '/api/reservations/{id}/cancel', [ReservationsController::class, 'cancel']);
