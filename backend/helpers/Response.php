<?php
namespace App\Helpers;

class Response
{
    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, string $message = 'OK', int $status = 200): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function created($data = null, string $message = 'Created'): void
    {
        self::success($data, $message, 201);
    }

    public static function error(string $message, int $status = 400): void
    {
        self::json([
            'success' => false,
            'error' => $message,
        ], $status);
    }

    public static function paginated(array $items, array $meta, string $message = 'OK'): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $items,
            'meta' => $meta,
        ]);
    }
}
