import { setDefaultTimeout } from '@cucumber/cucumber';

// Cucumber default é 5s e costuma ser pouco para E2E.
// Mantemos > timeouts padrão do Playwright (30s) para que erros sejam do Playwright.
setDefaultTimeout(Number(process.env.STEP_TIMEOUT_MS ?? 60_000));
