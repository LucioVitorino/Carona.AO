# Carona.AO - Frontend Base

Frontend Angular standalone com Angular Material, layout responsivo, tema escuro inicial, roteamento e integração base ao backend.

## Estrutura

- `src/app/layouts`: shell da aplicação
- `src/app/shared/components`: navbar e sidebar
- `src/app/core/services`: auth e api
- `src/app/guards`: proteção de rotas
- `src/app/interceptors`: envio automático do token JWT
- `src/app/pages`: home, login e dashboard

## Comandos

Instalar dependências:

```bash
npm install
```

Executar em desenvolvimento:

```bash
npm start
```

Gerar build de produção:

```bash
npm run build
```

## Observações

- O frontend aponta para `http://127.0.0.1:8000/api` em ambiente local.
- O login usa o backend já testado com as credenciais de demo.
- O interceptor anexa o token JWT às chamadas autenticadas.
