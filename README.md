# Coda Finances

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

### Planejadas

- [ ] Gestão de assinaturas e despesas recorrentes
- [ ] Cadastro de cartões de crédito
- [ ] Self-hosting
