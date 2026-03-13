# gherkin-to-json-e2e

Testes E2E com **Playwright + Cucumber** (BDD) para o conversor Gherkin → JSON.

## Setup

```bash
npm install
npx playwright install
```

## Executar testes

```bash
npm test                 # padrão (prod, headless)
npm run test:local       # app local (file://)
npm run test:prod        # produção
npm run test:headed      # browser visível
set TEST_ENV=local& set HEADLESS=0& npx cucumber-js #local com navegador aberto
npm run test:bdd:smoke   # apenas @smoke
```

### Variáveis de ambiente

| Variável | Valores | Descrição |
|----------|---------|-----------|
| `TEST_ENV` | `prod` (default) / `local` | Alterna entre produção e app local |
| `HEADLESS` | `1` (default) / `0` | Controla visibilidade do browser |
| `APP_BASE_URL` | URL | Override manual da URL base |

## Estrutura

```
tests/bdd/
  features/        → cenários Gherkin (.feature)
  steps/           → step definitions (TypeScript)
  pages/           → Page Objects
  support/         → World, Hooks, env, timeouts
    locators/      → seletores centralizados
```

## Relatórios

Gerados em `reports/` após cada execução: `cucumber.html` e `cucumber.json`.
