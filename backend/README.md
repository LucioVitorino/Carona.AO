# Carona.AO - Backend (skeleton)

Estrutura inicial do backend em PHP puro. Esta base define autoload PSR-4, rotas simples, conexão PDO e endpoints iniciais.

Comandos úteis:

Instalar dependências (executar em `backend/`):

```bash
composer install
```

Executar migrações formais:

```bash
php scripts/migrate.php
```

Carregar dados de desenvolvimento:

```bash
php scripts/seed.php
```

Atalho compatível para migrar e carregar seed:

```bash
php scripts/apply_schema.php
```

Executar servidor de desenvolvimento (PHP built-in):

```bash
php -S localhost:8000 -t public
```

Notas de configuração:
- Copie `.env.example` para `.env` e ajuste as credenciais do banco e `JWT_SECRET`.
- O autoload PSR-4 mapeia `App\\` para o diretório `backend/`.
- O schema principal está em `database/migrations/001_create_core_schema.sql` e os dados de demo em `database/seeds/001_demo_data.sql`.
