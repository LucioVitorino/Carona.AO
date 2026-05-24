<?php
namespace App\Routes;

use App\Helpers\Response;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'regex' => $this->compilePath($path),
            'handler' => $handler,
        ];
    }

    private function compilePath(string $path): string
    {
        $regex = preg_replace_callback('/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/', function (array $matches): string {
            return '(?P<' . $matches[1] . '>[^/]+)';
        }, $path);

        return '#^' . str_replace('#', '\\#', (string) $regex) . '$#';
    }

    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method);
        $uri = parse_url($uri, PHP_URL_PATH) ?: '/';

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;
            if (preg_match($route['regex'], $uri, $matches)) {
                $params = [];
                foreach ($matches as $key => $value) {
                    if (!is_int($key)) {
                        $params[$key] = $value;
                    }
                }

                $GLOBALS['route_params'] = $params;

                $handler = $route['handler'];
                if (is_callable($handler)) {
                    call_user_func($handler, $params);
                    return;
                }
                if (is_array($handler) && count($handler) === 2) {
                    [$class, $methodName] = $handler;
                    if (class_exists($class) && method_exists($class, $methodName)) {
                        call_user_func([new $class(), $methodName], $params);
                        return;
                    }
                }
            }
        }

        $GLOBALS['route_params'] = [];
        Response::error('Route not found', 404);
    }
}
