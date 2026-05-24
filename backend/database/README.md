# Base de Dados do Carona.AO

Este diretório guarda o esquema inicial MySQL do projeto.

## Estrutura

- `migrations/001_create_core_schema.sql`: cria as tabelas principais e relações.
- `seeds/001_demo_data.sql`: insere dados de demonstração para desenvolvimento.
- `scripts/migrate.php`: aplica migrações pendentes e regista o histórico.
- `scripts/seed.php`: carrega os dados de desenvolvimento.

## Ordem sugerida de uso

1. Criar a base de dados MySQL.
2. Executar `php scripts/migrate.php`.
3. Executar `php scripts/seed.php`, se necessário.

## Observações técnicas

- O esquema usa `InnoDB`, `utf8mb4` e chaves estrangeiras explícitas.
- As tabelas principais seguem o diagrama do sistema: `users`, `vehicles`, `rides`, `reservations`, `locations`, `reviews`.
- Foram adicionadas tabelas de suporte para produção: `notifications` e `ride_events`.
