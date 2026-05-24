<?php
namespace App\Helpers;

class Request
{
    public static function json(): array
    {
        $payload = file_get_contents('php://input');
        if ($payload === false || trim($payload) === '') {
            return [];
        }

        $decoded = json_decode($payload, true);
        return is_array($decoded) ? $decoded : [];
    }

    public static function query(string $key, $default = null)
    {
        return $_GET[$key] ?? $default;
    }

    public static function input(string $key, $default = null)
    {
        $body = self::json();
        if (array_key_exists($key, $body)) {
            return $body[$key];
        }

        return $_POST[$key] ?? $default;
    }

    public static function all(): array
    {
        return array_merge($_GET, self::json());
    }

    public static function routeParams(): array
    {
        return $GLOBALS['route_params'] ?? [];
    }

    public static function routeParam(string $key, $default = null)
    {
        $params = self::routeParams();
        return $params[$key] ?? $default;
    }

    public static function bearerToken(): ?string
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $authorization = $headers['Authorization'] ?? ($headers['authorization'] ?? null);

        if (!is_string($authorization)) {
            return null;
        }

        if (preg_match('/Bearer\s+(.*)$/i', $authorization, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }
}