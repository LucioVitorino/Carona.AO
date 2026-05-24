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

$serverPdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $password, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

$safeDatabase = str_replace('`', '``', $database);
$serverPdo->exec("CREATE DATABASE IF NOT EXISTS `{$safeDatabase}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

$pdo = new PDO("mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4", $user, $password, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
]);

$pdo->exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        batch INT UNSIGNED NOT NULL DEFAULT 1,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
);

$migrationDir = __DIR__ . '/../database/migrations';
$files = glob($migrationDir . '/*.sql') ?: [];
sort($files, SORT_NATURAL);

$applied = $pdo->query('SELECT filename FROM schema_migrations')->fetchAll(PDO::FETCH_COLUMN) ?: [];
$batch = ((int) ($pdo->query('SELECT COALESCE(MAX(batch), 0) AS max_batch FROM schema_migrations')->fetch()['max_batch'] ?? 0)) + 1;

$executeSqlFile = function (PDO $pdo, string $filePath): void {
    $sql = file_get_contents($filePath);
    if ($sql === false) {
        throw new RuntimeException('Unable to read migration file: ' . $filePath);
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
    $filename = basename($file);
    if (in_array($filename, $applied, true)) {
        continue;
    }

    $executeSqlFile($pdo, $file);
    $stmt = $pdo->prepare('INSERT INTO schema_migrations (filename, batch) VALUES (:filename, :batch)');
    $stmt->execute([
        'filename' => $filename,
        'batch' => $batch,
    ]);

    echo 'Applied migration: ' . $filename . PHP_EOL;
}

echo 'Migration process completed.' . PHP_EOL;