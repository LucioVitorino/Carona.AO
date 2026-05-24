<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\Helpers\Env;

Env::load(__DIR__ . '/../.env');

$host = Env::get('DB_HOST', '127.0.0.1');
$port = Env::get('DB_PORT', '3306');
$database = Env::get('DB_DATABASE', 'carona');
$user = Env::get('DB_USERNAME', 'root');
$password = Env::get('DB_PASSWORD', '');

$pdo = new PDO("mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4", $user, $password, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

$seedDir = __DIR__ . '/../database/seeds';
$files = glob($seedDir . '/*.sql') ?: [];
sort($files, SORT_NATURAL);

$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
foreach (['ride_events', 'notifications', 'reviews', 'locations', 'reservations', 'rides', 'vehicles', 'users'] as $table) {
    $pdo->exec('TRUNCATE TABLE ' . $table);
}
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');

$executeSqlFile = function (PDO $pdo, string $filePath): void {
    $sql = file_get_contents($filePath);
    if ($sql === false) {
        throw new RuntimeException('Unable to read seed file: ' . $filePath);
    }

    $statements = preg_split('/;\s*(?:\r?\n|$)/', $sql) ?: [];
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if ($statement !== '') {
            $pdo->exec($statement);
        }
    }
};

foreach ($files as $file) {
    $executeSqlFile($pdo, $file);
    echo 'Applied seed: ' . basename($file) . PHP_EOL;
}

echo 'Seed process completed.' . PHP_EOL;