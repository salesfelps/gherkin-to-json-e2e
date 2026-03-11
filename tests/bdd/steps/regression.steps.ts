import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import path from 'node:path';
import type { CustomWorld } from '../support/World.js';
import { AppPage } from '../pages/AppPage.js';
import { AppLocators } from '../support/locators/app.locators.js';

// ------------------------------
// Helpers
// ------------------------------

function fixturesPath(...parts: string[]): string {
  return path.resolve(process.cwd(), 'tests', 'bdd', 'fixtures', ...parts);
}

// ------------------------------
// State / boot
// ------------------------------

When('que eu limpo o estado da aplicação', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.hardResetAppState();
});

// ------------------------------
// Header (top)
// ------------------------------

When('eu preencho o cabeçalho obrigatório \\(Projeto e Repositório\\)', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.fillRequiredHeader();
});

When(
  'eu preencho o projeto do cabeçalho com {string}',
  async function (this: CustomWorld, value: string) {
    const app = new AppPage(this.page!);
    await app.fillHeaderProject(value);
  }
);

When(
  'eu preencho o repositório do cabeçalho com {string}',
  async function (this: CustomWorld, value: string) {
    const app = new AppPage(this.page!);
    await app.fillHeaderFolder(value);
  }
);

When(
  'eu preencho o responsável do topo com {string}',
  async function (this: CustomWorld, value: string) {
    const app = new AppPage(this.page!);
    await app.page.locator('#h-assignee').fill(value);
  }
);

Then(
  'devo ver o campo {string} visível no topo',
  async function (this: CustomWorld, fieldId: string) {
    const app = new AppPage(this.page!);
    await expect(app.page.locator(`#headerGrid #${fieldId}`)).toBeVisible();
  }
);

// ------------------------------
// Scenarios
// ------------------------------

When('eu adiciono um cenário', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.addScenario();
});

When(
  'eu preencho o título do cenário {int} com {string}',
  async function (this: CustomWorld, scenarioId: number, title: string) {
    const app = new AppPage(this.page!);
    await app.fillScenarioTitle(title, scenarioId);
  }
);

When(
  'eu preencho o Gherkin do cenário {int} com:',
  async function (this: CustomWorld, scenarioId: number, docString: string) {
    const app = new AppPage(this.page!);
    await app.fillGherkin(docString, scenarioId);
  }
);

When('eu movo o cenário {int} para cima', async function (this: CustomWorld, scenarioId: number) {
  const app = new AppPage(this.page!);
  // Click the scenario's own move-up button (there may be duplicates in rows view)
  const scenario = app.page.locator('#scenarios .scenario').nth(scenarioId - 1);
  await scenario.getByRole('button', { name: 'Mover cenário para cima' }).first().click();
});

Then('devo ver {int} cenários na tela', async function (this: CustomWorld, count: number) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#scenarios .scenario')).toHaveCount(count);
});

Then('devo ver {int} cenário na tela', async function (this: CustomWorld, count: number) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#scenarios .scenario')).toHaveCount(count);
});

Then('devo ver apenas {int} cenário visível', async function (this: CustomWorld, count: number) {
  const app = new AppPage(this.page!);
  const actual = await app.page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('#scenarios .scenario'));
    return els.filter((el) => {
      const s = (el as HTMLElement).style;
      return !s || s.display !== 'none';
    }).length;
  });
  expect(actual).toBe(count);
});

// ------------------------------
// Export JSON
// ------------------------------

When('eu clico em Gerar JSON \\(com Dataset\\)', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.generateJson();
  // Não continuar aqui. O teste valida o aviso e decide prosseguir.
});

When('eu clico em Gerar JSON', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.generateJson();

  // Para cenários que não validam explicitamente o aviso, prosseguir quando houver dataset.
  if (await app.page.locator('.simple-confirm-overlay:not(.hidden)').isVisible().catch(() => false)) {
    await app.page
      .locator('.simple-confirm-overlay:not(.hidden)')
      .getByRole('button', { name: 'Continuar' })
      .click();

    // Aguarde output ser preenchido
    await app.page.waitForFunction(() => {
      const output = document.getElementById('output')?.textContent ?? '';
      return output.trim().length > 0;
    });
  }
});

Then('devo ver o erro {string}', async function (this: CustomWorld, msg: string) {
  const app = new AppPage(this.page!);
  await app.expectErrorMessage(msg);
});

Then('devo ver um JSON gerado com indentação de 4 espaços', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const out = await app.readJsonOutput();
  expect(out).toContain('\n    ');
});

Then(
  'o JSON deve conter {int} cenário(s) na ordem da tela',
  async function (this: CustomWorld, count: number) {
    const app = new AppPage(this.page!);
    const parsed = (await app.parseJsonOutput()) as any[];
    expect(Array.isArray(parsed)).toBeTruthy();
    expect(parsed.length).toBe(count);

    const titles = await app.page.evaluate(() =>
      Array.from(document.querySelectorAll('#scenarios .scenario input[id^="title-"]')).map(
        (el) => (el as HTMLInputElement).value.trim()
      )
    );

    for (let i = 0; i < count; i += 1) {
      expect(parsed[i]?.fields?.summary).toBe(titles[i]);
    }
  }
);

Then(
  'o cenário {int} no JSON deve conter campos obrigatórios e conteúdo consistente',
  async function (this: CustomWorld, scenarioIndex1: number) {
    const app = new AppPage(this.page!);
    const parsed = (await app.parseJsonOutput()) as any[];
    const sc = parsed[scenarioIndex1 - 1];

    expect(sc).toBeTruthy();
    expect(sc.testtype).toBeTruthy();
    expect(sc.fields?.summary).toBeTruthy();
    expect(sc.fields?.project?.key).toBeTruthy();
    expect(typeof sc.gherkin_def).toBe('string');
    expect(sc.xray_test_repository_folder).toBeTruthy();

    const title = await app.readScenarioTitle(scenarioIndex1);
    expect(sc.fields.summary).toBe(title);

    expect(/\bThen\b/m.test(sc.gherkin_def)).toBeTruthy();
  }
);

Then(
  'o cenário {int} no JSON deve ter summary {string}',
  async function (this: CustomWorld, idx: number, expectedSummary: string) {
    const app = new AppPage(this.page!);
    const parsed = (await app.parseJsonOutput()) as any[];
    expect(parsed[idx - 1]?.fields?.summary).toBe(expectedSummary);
  }
);

When('eu baixo o JSON gerado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  this.lastDownload = await app.downloadGeneratedJson();
});

Then('o download do JSON deve ter extensão {string}', async function (this: CustomWorld, ext: string) {
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');
  const name = download.suggestedFilename();
  expect(name.endsWith(ext)).toBeTruthy();
});

// ------------------------------
// Spreadsheet (CSV)
// ------------------------------

When('eu gero a planilha CSV \\(com aviso\\)', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  // Disparar geração pela UI
  await app.clickExportGenerateSheet().catch(async () => {
    await app.page.evaluate(() => {
      // @ts-ignore
      globalThis.App?.generateSpreadsheet?.();
    });
  });

  // Aguardar o aviso aparecer
  await expect(app.page.locator('.simple-confirm-overlay:not(.hidden)')).toBeVisible();
});

When('eu gero a planilha CSV', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.generateSpreadsheet();
});

Then('deve existir um chip de arquivo CSV gerado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#generatedFiles .generated-file[data-format="csv"]')).toBeVisible();
});

When('eu baixo o CSV gerado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  this.lastDownload = await app.downloadGeneratedCsv();
});

Then('o download do CSV deve ter extensão {string}', async function (this: CustomWorld, ext: string) {
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');
  const name = download.suggestedFilename();
  expect(name.endsWith(ext)).toBeTruthy();
});

Then(
  'deve abrir um aviso de exportação por planilha informando que responsável não é suportado',
  async function (this: CustomWorld) {
    const app = new AppPage(this.page!);
    const overlay = app.page.locator('.simple-confirm-overlay:not(.hidden)');
    await expect(overlay).toContainText('o campo "Responsável" não é suportado');
    await overlay.getByRole('button', { name: 'Continuar' }).click();

    // Após continuar, o chip CSV deve aparecer
    await expect(app.page.locator('#generatedFiles .generated-file[data-format="csv"]')).toBeVisible({
      timeout: 30_000,
    });
  }
);

// ------------------------------
// Bulk
// ------------------------------

When('eu abro o modo de colar cenários', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.page.locator('#bulkBtn').click();
  await expect(app.page.locator('#bulkBox')).toBeVisible();
});

When('eu colo o texto bulk:', async function (this: CustomWorld, docString: string) {
  const app = new AppPage(this.page!);
  await app.page.locator('#bulkInput').fill(docString);
});

When('eu clico em Converter \\(bulk\\)', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.page.evaluate(async () => {
    // @ts-ignore
    await globalThis.App?.convertBulk?.();
  });
});

Then('devo ver o erro de bulk {string}', async function (this: CustomWorld, msg: string) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#bulkError')).toHaveText(msg);
});

When('eu colo {int} cenários válidos no bulk', async function (this: CustomWorld, n: number) {
  const app = new AppPage(this.page!);
  const parts: string[] = [];
  for (let i = 1; i <= n; i += 1) {
    parts.push(`Scenario: Sc ${i}\n  Given a\n  When b\n  Then c\n`);
  }
  await app.page.locator('#bulkInput').fill(parts.join('\n'));
});

// ------------------------------
// Dataset
// ------------------------------

When('eu abro o modal de Dataset do cenário {int}', async function (this: CustomWorld, sid: number) {
  const app = new AppPage(this.page!);
  await app.openDatasetModalForScenario(sid);
});

When('eu adiciono o parâmetro de dataset {string}', async function (this: CustomWorld, name: string) {
  const app = new AppPage(this.page!);
  await app.datasetAddParameterExpectSuccess(name);
});

When(
  'eu tento adicionar o parâmetro de dataset duplicado {string}',
  async function (this: CustomWorld, name: string) {
    const app = new AppPage(this.page!);
    await app.datasetAddParameter(name);
  }
);

When('eu adiciono uma variável \\(linha\\) no dataset', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.datasetAddRow();
});

When(
  'eu preencho a célula do dataset \\(variável {int}, parâmetro {string}\\) com {string}',
  async function (this: CustomWorld, row: number, param: string, value: string) {
    const app = new AppPage(this.page!);
    await app.datasetFillCell(row, param, value);
  }
);

When('eu salvo o dataset', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.datasetSave();
});

Then(
  'deve abrir um aviso de Dataset com a mensagem de importação via CSV',
  async function (this: CustomWorld) {
    const app = new AppPage(this.page!);
    const overlay = app.page.locator('.simple-confirm-overlay:not(.hidden)');
    await expect(overlay).toContainText(
      'A importação do Dataset é feita via arquivo .csv dentro do Jira'
    );
    await overlay.getByRole('button', { name: 'Continuar' }).click();

    // Após continuar, o JSON deve ser renderizado
    await expect(app.page.locator('#output')).toBeVisible({ timeout: 30_000 });
  }
);

Then('deve existir ao menos 1 arquivo de Dataset gerado para download', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const count = await app.getDatasetChipCount();
  expect(count).toBeGreaterThan(0);
});

When('eu baixo o primeiro CSV de Dataset gerado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  this.lastDownload = await app.downloadFirstDatasetCsv();
});

Then('o download do Dataset deve ter extensão {string}', async function (this: CustomWorld, ext: string) {
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');
  const name = download.suggestedFilename();
  expect(name.endsWith(ext)).toBeTruthy();
});

When('eu importo parâmetros do cenário Gherkin', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const modal = app.page.locator('.db-modal');
  await expect(modal).toBeVisible();
  await modal.locator('button[aria-label="Importar parâmetros do cenário Gherkin"]').click();
});

Then('devo ver o parâmetro {string} listado no dataset', async function (this: CustomWorld, param: string) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('.db-table thead')).toContainText(param);
});

Then('devo ver o erro do dataset {string}', async function (this: CustomWorld, msg: string) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('.db-sub-overlay:not(.hidden) .db-error:not(.hidden)')).toHaveText(msg);
});

When('eu tento fechar o dataset pelo botão {string}', async function (this: CustomWorld, label: string) {
  const app = new AppPage(this.page!);
  await app.page.getByRole('button', { name: label }).click();
});

Then('devo ver o aviso de alterações não salvas no dataset', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('.db-unsaved-hint:not(.hidden)')).toBeVisible();
});

When('eu cancelo o dataset \\(descartar\\)', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.page.getByRole('button', { name: 'Cancelar' }).click();
});

Then('o modal de dataset deve estar fechado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('.db-overlay:not(.hidden)')).toHaveCount(0);
});

// ------------------------------
// Inline config
// ------------------------------

When(
  'eu defino o campo {string} do topo como variável por cenário',
  async function (this: CustomWorld, fieldId: string) {
    const app = new AppPage(this.page!);
    await app.setHeaderFieldAsVariable(fieldId);
  }
);

When(
  'eu preencho o Projeto do cenário {int} com {string}',
  async function (this: CustomWorld, scenarioId: number, value: string) {
    const app = new AppPage(this.page!);
    await app.fillScenarioVariableProject(value, scenarioId);
  }
);

When(
  'eu preencho o Repositório do cenário {int} com {string}',
  async function (this: CustomWorld, scenarioId: number, value: string) {
    const app = new AppPage(this.page!);
    await app.fillScenarioVariableFolder(value, scenarioId);
  }
);

When(
  'eu volto o campo {string} do cenário {int} para padrão',
  async function (this: CustomWorld, label: string, scenarioId: number) {
    const app = new AppPage(this.page!);
    const fieldId = label === 'Projeto' ? `sc-project-${scenarioId}` : `sc-folder-${scenarioId}`;
    await app.setScenarioFieldAsDefault(fieldId);
  }
);

// ------------------------------
// Import
// ------------------------------

When('eu importo este JSON baixado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');

  const target = path.resolve(process.cwd(), 'tests', 'bdd', 'fixtures', 'tmp-import.json');
  await download.saveAs(target);

  await app.triggerImportJson(target);
});

When('eu importo este CSV baixado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');

  // Em alguns ambientes, download.path() aponta para um arquivo temporário sem extensão.
  // Salvar explicitamente com .csv para passar validação de extensão.
  const target = path.resolve(process.cwd(), 'tests', 'bdd', 'fixtures', 'tmp-import.csv');
  await download.saveAs(target);

  await app.triggerImportCsv(target);
});

When(
  'eu tento importar o JSON inválido {string}',
  async function (this: CustomWorld, filename: string) {
    this.lastInvalidImportFile = fixturesPath(filename);
  }
);

When(
  'eu tento importar o CSV inválido {string}',
  async function (this: CustomWorld, filename: string) {
    this.lastInvalidImportFile = fixturesPath(filename);
  }
);

Then(
  'devo ver a notificação de importação com erro {string}',
  async function (this: CustomWorld, msg: string) {
    const app = new AppPage(this.page!);
    const filePath = this.lastInvalidImportFile;
    if (!filePath) throw new Error('Arquivo inválido não informado (lastInvalidImportFile).');
    if (filePath.endsWith('.json')) {
      await app.triggerImportJsonExpectError(filePath, msg);
    } else {
      await app.triggerImportCsvExpectError(filePath, msg);
    }
  }
);

// ------------------------------
// Backup
// ------------------------------

When('eu aguardo o baseline de backup ficar pronto', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.waitForBackupBaselineReady();
});

When('eu simulo tentativa de sair para exibir indicador de backup pendente', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.triggerBeforeUnloadAndShowBackupPending();
});

Then('o botão de backup deve exibir {string}', async function (this: CustomWorld, text: string) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#backupStatusBtn')).toHaveText(text);
});

Then('o botão de backup deve estar em estado {string}', async function (this: CustomWorld, level: string) {
  const app = new AppPage(this.page!);
  const btn = app.page.locator('#backupStatusBtn');

  // Espera ativa: o indicador só aparece após beforeunload + focus.
  if (level === 'warn') {
    await expect(btn).toHaveClass(/is-warn/, { timeout: 10_000 });
  } else if (level === 'danger') {
    await expect(btn).toHaveClass(/is-danger/, { timeout: 10_000 });
  } else {
    throw new Error('Nível inválido: ' + level);
  }
});

When('eu faço backup e baixo o arquivo', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  this.lastDownload = await app.exportBackupAndDownload();
});

Then('o download do backup deve ter extensão {string}', async function (this: CustomWorld, ext: string) {
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');
  const name = download.suggestedFilename();
  expect(name.endsWith(ext)).toBeTruthy();
});

When('eu restauro o backup baixado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const download = this.lastDownload;
  if (!download) throw new Error('Download não encontrado no World (lastDownload).');
  const filePath = await download.path();
  if (!filePath) throw new Error('Não foi possível obter o path do download do backup.');
  await app.importBackupFromFile(filePath);
});

Then(
  'devo ver o título do cenário {int} como {string}',
  async function (this: CustomWorld, sid: number, expectedTitle: string) {
    const app = new AppPage(this.page!);
    await expect(app.page.locator(`#title-${sid}`)).toHaveValue(expectedTitle);
  }
);

// ------------------------------
// Tags
// ------------------------------

When('eu abro o seletor de tags do cenário {int}', async function (this: CustomWorld, sid: number) {
  const app = new AppPage(this.page!);
  await app.openTagSelectorForScenario(sid);
});

When('eu crio uma nova tag {string}', async function (this: CustomWorld, tagName: string) {
  const app = new AppPage(this.page!);
  await app.addNewTag(tagName);
});

When(
  'eu seleciono a tag {string} no cenário {int}',
  async function (this: CustomWorld, tagName: string, _sid: number) {
    const app = new AppPage(this.page!);
    const menu = app.page.locator('.tag-selector-menu');
    await expect(menu).toBeVisible();

    const row = menu.locator('.tag-selector-row', {
      has: menu.locator('.tag-selector-label', { hasText: tagName }),
    });

    if (await row.count()) {
      await expect(row).toBeVisible();
      await row.locator('button.tag-selector-item').click();
      return;
    }

    // fallback: alguns layouts podem renderizar como botão direto com texto
    await menu.locator('button.tag-selector-item', { hasText: tagName }).first().click();
  }
);

Then(
  'o botão de tags do cenário {int} deve mostrar {string}',
  async function (this: CustomWorld, scenarioId: number, label: string) {
    const app = new AppPage(this.page!);
    const btn = app.page.locator(`#title-${scenarioId}`).locator('xpath=ancestor::*[contains(@class,"scenario")]').locator('.scenario-tag-wrapper .scenario-tag-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(label);
  }
);

Then('devo ver a aba de filtro de tags contendo {string}', async function (this: CustomWorld, tagName: string) {
  const app = new AppPage(this.page!);
  const tabs = app.page.locator('#scenarioTagsTabs');
  await expect(tabs).toBeVisible({ timeout: 10_000 });
  await expect(tabs).toContainText(tagName, { timeout: 10_000 });
});

When('eu filtro cenários pela tag {string}', async function (this: CustomWorld, tagName: string) {
  const app = new AppPage(this.page!);
  await app.page.locator('#scenarioTagsTabs').getByRole('button', { name: tagName }).click();
});

// ------------------------------
// UX
// ------------------------------

When('eu guardo o tema atual', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const theme = await app.page.locator('html').getAttribute('data-theme');
  this._prevTheme = theme;
});

When('eu alterno o tema', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const before = await app.page.locator('html').getAttribute('data-theme');
  await app.toggleTheme();
  // esperar realmente mudar
  await app.page.waitForFunction((prev) => {
    return document.documentElement.getAttribute('data-theme') !== prev;
  }, before);

  // e persistir em localStorage (usado pelo backup-manager)
  await app.page.waitForFunction((prev) => {
    try {
      return (localStorage.getItem('xGherkin:theme') || '') !== (prev || '');
    } catch {
      return true;
    }
  }, before);
});

Then('o tema deve ter mudado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const prev = this._prevTheme;
  const cur = await app.page.locator('html').getAttribute('data-theme');
  expect(cur).toBeTruthy();
  expect(cur).not.toBe(prev);
  this._toggledTheme = cur;
});

Then('o tema deve permanecer o mesmo após reload', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const expected = this._toggledTheme;
  const cur = await app.page.locator('html').getAttribute('data-theme');
  expect(cur).toBe(expected);
});

When('eu recarrego a página', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.reloadAndWait();
});

Then('a visualização de cenários deve estar em {string}', async function (this: CustomWorld, mode: string) {
  const app = new AppPage(this.page!);
  const container = app.page.locator('#scenarios');
  if (mode === 'rows') {
    await expect(container).toHaveClass(/scenario-view-rows/);
  } else if (mode === 'blocks') {
    await expect(container).not.toHaveClass(/scenario-view-rows/);
  } else {
    throw new Error('Modo inválido: ' + mode);
  }
});

When('eu alterno a visualização de cenários', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.toggleScenarioView();
});

Then('os campos do topo devem estar visíveis', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#headerGrid')).toBeVisible();
});

When('eu colapso os campos do topo', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.collapseHeaderFields();
});

Then('os campos do topo devem estar ocultos', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(app.page.locator('#headerGrid')).toBeHidden();
});

When('eu ajusto o viewport para {int} por {int}', async function (this: CustomWorld, w: number, h: number) {
  const app = new AppPage(this.page!);
  await app.setViewport(w, h);
});

Then(
  'devo ver o overlay de mobile com o título {string}',
  async function (this: CustomWorld, title: string) {
    const app = new AppPage(this.page!);
    await expect(app.page.locator('#mobileBlockOverlay')).toBeVisible();
    await expect(app.page.locator('#mobileBlockTitle')).toHaveText(title);
  }
);

// ------------------------------
// Shared Background
// ------------------------------

Given('que eu acesso a aplicação', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.open(this.env.baseUrl);
  await app.hardResetAppState();
});

// ------------------------------
// Gherkin assertions
// ------------------------------

Then(
  'devo ver o Gherkin do cenário {int} contendo {string}',
  async function (this: CustomWorld, sid: number, text: string) {
    const app = new AppPage(this.page!);
    const gherkin = await app.readScenarioGherkin(sid);
    expect(gherkin).toContain(text);
  }
);

Then(
  'o Gherkin do cenário {int} deve conter {string}',
  async function (this: CustomWorld, sid: number, text: string) {
    const app = new AppPage(this.page!);
    const gherkin = await app.readScenarioGherkin(sid);
    expect(gherkin).toContain(text);
  }
);

Then(
  'o Gherkin do cenário {int} não deve conter {string}',
  async function (this: CustomWorld, sid: number, text: string) {
    const app = new AppPage(this.page!);
    const gherkin = await app.readScenarioGherkin(sid);
    expect(gherkin).not.toContain(text);
  }
);

// ------------------------------
// Copy JSON
// ------------------------------

When('eu copio o JSON gerado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  // Grant clipboard permissions
  await app.page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await AppLocators.copyJsonButton(app.page).click();
});

Then('o botão de copiar deve exibir {string}', async function (this: CustomWorld, text: string) {
  const app = new AppPage(this.page!);
  await expect(AppLocators.copyJsonButton(app.page)).toContainText(text);
});

// ------------------------------
// JSON Gherkin normalization
// ------------------------------

Then(
  'o Gherkin do cenário {int} no JSON deve conter {string}',
  async function (this: CustomWorld, idx: number, keyword: string) {
    const app = new AppPage(this.page!);
    const parsed = (await app.parseJsonOutput()) as any[];
    const gherkin = parsed[idx - 1]?.gherkin_def ?? '';
    expect(gherkin).toContain(keyword);
  }
);

// ------------------------------
// CSV content validation
// ------------------------------

Then(
  'o conteúdo do CSV deve conter o cabeçalho {string}',
  async function (this: CustomWorld, header: string) {
    const download = this.lastDownload;
    if (!download) throw new Error('Download não encontrado no World (lastDownload).');
    const filePath = await download.path();
    if (!filePath) throw new Error('Não foi possível obter o path do download.');
    const fs = await import('node:fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain(header);
  }
);

Then(
  'o conteúdo do CSV deve conter delimitador {string}',
  async function (this: CustomWorld, delimiter: string) {
    const download = this.lastDownload;
    if (!download) throw new Error('Download não encontrado no World (lastDownload).');
    const filePath = await download.path();
    if (!filePath) throw new Error('Não foi possível obter o path do download.');
    const fs = await import('node:fs/promises');
    const content = await fs.readFile(filePath, 'utf-8');
    expect(content).toContain(delimiter);
  }
);

// ------------------------------
// Tags (remove / toggle)
// ------------------------------

When(
  'eu desmarco a tag {string} do cenário {int}',
  async function (this: CustomWorld, tagName: string, _sid: number) {
    const app = new AppPage(this.page!);
    const menu = app.page.locator('.tag-selector-menu');
    await expect(menu).toBeVisible();

    // Find the checked tag and toggle it off
    const row = menu.locator('.tag-selector-row', {
      has: menu.locator('.tag-selector-label', { hasText: tagName }),
    });

    if (await row.count()) {
      await row.locator('button.tag-selector-item').click();
      return;
    }

    await menu.locator('button.tag-selector-item', { hasText: tagName }).first().click();
  }
);

Then(
  'o botão de tags do cenário {int} não deve mostrar {string}',
  async function (this: CustomWorld, scenarioId: number, label: string) {
    const app = new AppPage(this.page!);
    const btn = app.page
      .locator(`#title-${scenarioId}`)
      .locator('xpath=ancestor::*[contains(@class,"scenario")]')
      .locator('.scenario-tag-wrapper .scenario-tag-btn');
    // The tag button may not contain the text anymore, or may show default text
    await expect(btn).not.toContainText(label);
  }
);

// ------------------------------
// Dataset (remove param / CSV import)
// ------------------------------

When(
  'eu removo o parâmetro {string} do dataset',
  async function (this: CustomWorld, paramName: string) {
    const app = new AppPage(this.page!);
    const modal = app.page.locator('.db-modal');
    await expect(modal).toBeVisible();
    // Open context menu for the parameter, then click "Excluir"
    await modal.locator(`button[aria-label="Opções do parâmetro ${paramName}"]`).click();
    await app.page.locator('button[role="menuitem"]', { hasText: 'Excluir' }).click();
  }
);

Then(
  'não devo ver o parâmetro {string} listado no dataset',
  async function (this: CustomWorld, param: string) {
    const app = new AppPage(this.page!);
    await expect(app.page.locator('.db-table thead')).not.toContainText(param);
  }
);

When(
  'eu importo CSV no modal de Dataset com o arquivo {string}',
  async function (this: CustomWorld, filename: string) {
    const app = new AppPage(this.page!);
    const modal = app.page.locator('.db-modal');
    await expect(modal).toBeVisible();

    const fileChooserPromise = app.page.waitForEvent('filechooser');
    await modal.locator('button[aria-label="Importar CSV"]').click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(fixturesPath(filename));
  }
);

// ------------------------------
// Search & Replace
// ------------------------------

When('eu abro o painel de busca e substituição', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.openFabMenu();
  await app.page.getByRole('button', { name: /buscar e substituir/i }).click();
  await expect(AppLocators.searchReplacePanel(app.page)).toBeVisible();
});

Then('devo ver o painel de busca e substituição aberto', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(AppLocators.searchReplacePanel(app.page)).toBeVisible();
});

When('eu busco por {string}', async function (this: CustomWorld, text: string) {
  const app = new AppPage(this.page!);
  await AppLocators.searchReplaceSearchInput(app.page).fill(text);
  // Wait for counter to update
  await app.page.waitForTimeout(300);
});

Then(
  'o contador de resultados de busca deve mostrar {string} ocorrências',
  async function (this: CustomWorld, count: string) {
    const app = new AppPage(this.page!);
    const counter = AppLocators.searchReplaceCounter(app.page);
    await expect(counter).toContainText(count);
  }
);

When('eu preencho a substituição com {string}', async function (this: CustomWorld, text: string) {
  const app = new AppPage(this.page!);
  await AppLocators.searchReplaceReplaceInput(app.page).fill(text);
});

When('eu clico em substituir tudo', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await app.page.locator('.search-replace-panel').getByRole('button', { name: /substituir todas/i }).click();
  await app.page.waitForTimeout(300);
});

When('eu fecho o painel de busca e substituição', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await AppLocators.searchReplaceCloseButton(app.page).click();
});

Then('o painel de busca e substituição deve estar fechado', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  await expect(AppLocators.searchReplacePanel(app.page)).toBeHidden();
});

// ------------------------------
// Priority
// ------------------------------

Then(
  'a prioridade do cenário {int} deve ser {string}',
  async function (this: CustomWorld, sid: number, expected: string) {
    const app = new AppPage(this.page!);
    const btn = AppLocators.scenarioPriorityButtonById(app.page, sid);
    await expect(btn).toContainText(expected);
  }
);

When(
  'eu altero a prioridade do cenário {int} para {string}',
  async function (this: CustomWorld, sid: number, priority: string) {
    const app = new AppPage(this.page!);
    const btn = AppLocators.scenarioPriorityButtonById(app.page, sid);
    await btn.click();
    // Wait for priority menu
    const menu = app.page.locator('.priority-menu');
    await expect(menu).toBeVisible();
    await menu.getByRole('menuitemradio', { name: priority }).click();
    await expect(menu).toBeHidden();
  }
);

Then(
  'o JSON do cenário {int} deve conter prioridade {string}',
  async function (this: CustomWorld, idx: number, expected: string) {
    const app = new AppPage(this.page!);
    const parsed = (await app.parseJsonOutput()) as any[];
    const sc = parsed[idx - 1];
    // Priority is stored as { name: "4 - Alto" } object or a plain string
    const raw = sc?.priority ?? sc?.fields?.priority ?? '';
    const priority = typeof raw === 'object' && raw !== null ? (raw.name ?? '') : String(raw);
    expect(priority).toContain(expected.charAt(0));
  }
);

// ------------------------------
// Scenario Management (remove)
// ------------------------------

When('eu removo o cenário {int}', async function (this: CustomWorld, sid: number) {
  const app = new AppPage(this.page!);
  const scenarios = app.page.locator('#scenarios .scenario');
  const countBefore = await scenarios.count();
  const scenario = scenarios.nth(sid - 1);
  // Use the remove button inside row-details (the row-header one may be hidden)
  await scenario.locator('.scenario-row-details .remove-btn').click();
  // Wait for animated removal to complete
  await expect(scenarios).toHaveCount(countBefore - 1);
});

When('eu tento remover o cenário {int}', async function (this: CustomWorld, sid: number) {
  const app = new AppPage(this.page!);
  const scenario = app.page.locator('#scenarios .scenario').nth(sid - 1);
  const removeBtn = scenario.locator('.scenario-row-details .remove-btn');
  // May not be clickable if only 1 scenario
  if (await removeBtn.isVisible().catch(() => false)) {
    await removeBtn.click().catch(() => {});
  }
});

// ------------------------------
// Persist
// ------------------------------

When('eu troco o tema', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const before = await app.page.locator('html').getAttribute('data-theme');
  this._prevTheme = before;
  await app.toggleTheme();
  await app.page.waitForFunction(
    (prev: string | null) => document.documentElement.getAttribute('data-theme') !== prev,
    before
  );
  this._toggledTheme = await app.page.locator('html').getAttribute('data-theme');
});

Then('o tema deve estar diferente do padrão', async function (this: CustomWorld) {
  const app = new AppPage(this.page!);
  const cur = await app.page.locator('html').getAttribute('data-theme');
  const expected = this._toggledTheme;
  if (expected) {
    expect(cur).toBe(expected);
  } else {
    // Just verify theme is set
    expect(cur).toBeTruthy();
  }
});

// ------------------------------
// Import JSON (restored content)
// ------------------------------
// 'devo ver o título do cenário {int} como {string}' already defined above
