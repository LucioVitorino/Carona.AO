<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Helpers\Env;
use App\Helpers\Response;
use App\Routes\Router;

// Load environment
Env::load(__DIR__ . '/../.env');

// Basic CORS + JSON setup
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Error handling
set_exception_handler(function (Throwable $e) {
    $debug = filter_var((string) Env::get('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);
    Response::error($debug ? $e->getMessage() : 'Internal server error', $e->getCode() ?: 500);
});

$router = new Router();
require __DIR__ . '/../routes/web.php';

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
