import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { CustomWorld } from '../support/World.js';
import { AppPage } from '../pages/AppPage.js';

Given('que estou na aplicação do conversor', async function (this: CustomWorld) {
  expect(this.page, 'Playwright page não inicializada (Hook Before)')
    .toBeTruthy();

  const app = new AppPage(this.page!);
  await app.open(this.env.baseUrl);
});

Then('devo ver que a página carregou', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.assertLoaded();
});

When(
  'eu preencho o campo Gherkin com:',
  async function (this: CustomWorld, docString: string) {
    const app = new AppPage(this.page!);

    // Garantir pré-requisitos do app (para conseguir gerar JSON)
    await app.fillRequiredHeader();
    await app.fillScenarioTitle('Cenário automático', 1);

    await app.fillGherkin(docString, 1);
  }
);

When('eu clico em Converter', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.clickGenerate(); // Novo método que trata modal
});

Then('devo ver um JSON gerado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const json = await app.getGeneratedJson(); // Novo método com timeout melhor

  // Assert bem simples: não vazio e parece JSON válido
  expect(json).toBeTruthy();
  expect(typeof json === 'object').toBeTruthy();
});
