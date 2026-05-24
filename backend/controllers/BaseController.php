<?php
namespace App\Controllers;

use App\Helpers\ApiException;
use App\Helpers\Env;
use App\Helpers\Response;

abstract class BaseController
{
    protected function respond(callable $callback): void
    {
        try {
            $result = $callback();

            if ($result === null) {
                Response::success(null);
                return;
            }

            if (is_array($result) && array_key_exists('items', $result) && array_key_exists('meta', $result)) {
                Response::paginated($result['items'], $result['meta']);
                return;
            }

            Response::success($result);
        } catch (ApiException $e) {
            Response::error($e->getMessage(), $e->statusCode());
        } catch (\Throwable $e) {
            $debug = filter_var((string) Env::get('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOLEAN);
            Response::error($debug ? $e->getMessage() : 'Internal server error', 500);
        }
    }

    protected function actor(): array
    {
        return $GLOBALS['auth_user'] ?? [];
    }
}