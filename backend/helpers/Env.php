<?php
namespace App\Helpers;

class Env
{
    public static function load(string $path): void
    {
        $envFile = dirname($path) . DIRECTORY_SEPARATOR . '.env';
        if (!file_exists($envFile)) {
            return;
        }

        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            [$name, $value] = array_map('trim', explode('=', $line, 2) + [1 => '']);
            if ($name === '') continue;
            if (!isset($_ENV[$name])) {
                $_ENV[$name] = $value;
                putenv("$name=$value");
            }
        }
    }

    public static function get(string $key, $default = null)
    {
        $val = $_ENV[$key] ?? getenv($key);
        return $val === false || $val === null ? $default : $val;
    }
}
