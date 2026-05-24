<?php
namespace App\Middlewares;

use App\Helpers\Response;
use App\Helpers\Env;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware
{
    public static function guard(): void
    {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? null);
        if (!$auth) {
            Response::error('Unauthorized', 401);
        }

        if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            $token = $matches[1];
            try {
                $secret = Env::get('JWT_SECRET');
                $payload = JWT::decode($token, new Key($secret, 'HS256'));
                $actor = json_decode(json_encode($payload), true) ?: [];
                if (isset($actor['sub'])) {
                    $actor['sub'] = (int) $actor['sub'];
                }
                $GLOBALS['auth_user'] = $actor;
            } catch (\Exception $e) {
                Response::error('Invalid token', 401);
            }
        } else {
            Response::error('Invalid authorization header', 401);
        }
    }
}
