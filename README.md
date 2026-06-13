# Coda Finances

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

O Coda surgiu da necessidade de ter uma ferramenta que me ajudasse a ter uma melhor visão das minhas finanças pessoais. Faz parte do meu homelab [Decoda](https://github.com/marlonseben1/decoda).

Inicialmente a stack que pretendia utilizar era React + ElysiaJS, mas acabei optando por Laravel no backend por conta da matéria na faculdade.

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.5) + SQLite 3
- **Frontend:** React 19 + Inertia.js v3 + Tailwind CSS v4
- **Testes:** Pest v4

## Funcionalidades

### Implementadas

- [x] Dashboard com gráficos de acompanhamento de receitas e despesas
- [x] Extrato com filtros, ordenação e paginação
- [x] Marcar transações como pago/recebido e não pago/não recebido
- [x] CRUD de contas bancárias
- [x] CRUD de categorias de receita e despesa
- [x] CRUD de transações (receitas e despesas)
- [x] Categorias aninhadas (subcategorias)
- [x] Responsividade geral
- [x] Self-hosting

### Planejadas

- [ ] Gestão de assinaturas e despesas recorrentes
- [ ] Cadastro de cartões de crédito

## Instalação

O Coda roda via Docker. Você vai precisar do [Docker](https://docs.docker.com/get-docker/) com o plugin Compose instalado.

### 1. Clone o repositório

```bash
git clone https://github.com/marlonseben1/coda.git
cd coda
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha as variáveis obrigatórias:

```bash
cp .env.example .env.production
```

```env
APP_KEY=    # gere com: php -r "echo 'base64:'.base64_encode(random_bytes(32));"
APP_URL=http://localhost:8080
APP_ENV=production
APP_DEBUG=false
```

### 3. Suba os containers

```bash
docker compose up -d
```

A aplicação estará disponível em `http://localhost:8080`. As migrations são aplicadas automaticamente na primeira inicialização.

### 4. Crie seu usuário

O Coda não possui tela de cadastro público. Crie seu usuário diretamente pelo terminal:

```bash
docker compose exec app php artisan tinker --execute "App\Models\User::create(['name' => 'Seu Nome', 'email' => 'seu@email.com', 'password' => bcrypt('sua-senha')]);"
```

### Atualizando

Para atualizar para uma versão mais nova, basta fazer pull e reconstruir a imagem:

```bash
git pull
docker compose up -d --build
```

O banco de dados SQLite e os arquivos de storage são persistidos em volumes Docker e não são afetados pela atualização.

---

## Installation

Coda runs via Docker. You'll need [Docker](https://docs.docker.com/get-docker/) with the Compose plugin installed.

### 1. Clone the repository

```bash
git clone https://github.com/marlonseben1/coda.git
cd coda
```

### 2. Set up environment variables

Copy the example file and fill in the required variables:

```bash
cp .env.example .env.production
```

```env
APP_KEY=    # generate with: php -r "echo 'base64:'.base64_encode(random_bytes(32));"
APP_URL=http://localhost:8080
APP_ENV=production
APP_DEBUG=false
```

### 3. Start the containers

```bash
docker compose up -d
```

The application will be available at `http://localhost:8080`. Migrations run automatically on first startup.

### 4. Create your user

Coda does not have a public registration page. Create your user directly from the terminal:

```bash
docker compose exec app php artisan tinker --execute "App\Models\User::create(['name' => 'Your Name', 'email' => 'your@email.com', 'password' => bcrypt('your-password')]);"
```

### Updating

To update to a newer version, pull the latest changes and rebuild the image:

```bash
git pull
docker compose up -d --build
```

The SQLite database and storage files are persisted in Docker volumes and are not affected by the update.
