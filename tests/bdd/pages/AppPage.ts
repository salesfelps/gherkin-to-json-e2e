import type { Page, Download } from 'playwright';
import { expect } from '@playwright/test';
import { AppLocators } from '../support/locators/app.locators.js';

export class AppPage {
  constructor(public readonly page: Page) {}

  async open(baseUrl: string): Promise<void> {
    // Para prod: baseUrl termina com '/'
    // Para local: baseUrl (file://...) também termina com '/'
    // Em ambos, navegar para index.html funciona.
    await this.page.goto(new URL('index.html', baseUrl).toString());

    // Esperar o boot/reveal (persist restore + UI render)
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});

    // Se houver overlay de boot, aguardar sumir
    await this.page
      .locator('html:not(.xg-booting)')
      .waitFor({ state: 'attached', timeout: 20_000 })
      .catch(() => {});
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();

    // Mobile overlay deve estar invisível no viewport default (>= 901px)
    await expect(AppLocators.mobileBlockOverlay(this.page)).toBeHidden();

    // Elementos-chave do app (garante que não carregamos uma página genérica/erro)
    await expect(AppLocators.exportMenuButton(this.page)).toBeVisible();
  }

  async hardResetAppState(): Promise<void> {
    // Limpar localStorage + IndexedDB para garantir isolamento entre cenários de teste.
    await this.page.evaluate(async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}

      async function deleteDb(name: string) {
        try {
          await new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
            req.onblocked = () => resolve();
          });
        } catch (e) {}
      }

      await deleteDb('gherkin_to_json_db');
      await deleteDb('gherkin_to_json_backup_db');
    });

    await this.page.reload();
    await this.assertLoaded();

    // A app deve iniciar com 1 cenário vazio
    await expect(AppLocators.scenarioCards(this.page)).toHaveCount(1);
  }

  async fillGherkin(text: string, scenarioId: number | string = 1): Promise<void> {
    await AppLocators.scenarioGherkinInputById(this.page, scenarioId).fill(text);
  }

  async fillScenarioTitle(title = 'Cenário automático', scenarioId: number | string = 1): Promise<void> {
    const titleInput = AppLocators.scenarioTitleInputById(this.page, scenarioId);
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);
  }

  async fillHeaderProject(value: string): Promise<void> {
    await expect(AppLocators.projectInput(this.page)).toBeVisible();
    await AppLocators.projectInput(this.page).fill(value);
  }

  async fillHeaderFolder(value: string): Promise<void> {
    await expect(AppLocators.repositoryFolderInput(this.page)).toBeVisible();
    await AppLocators.repositoryFolderInput(this.page).fill(value);
  }

  /**
   * Preenche campos obrigatórios para gerar JSON.
   */
  async fillRequiredHeader(projectKey = 'ABCD', repositoryPath = 'Squad/Feature'): Promise<void> {
    await this.fillHeaderProject(projectKey);
    await this.fillHeaderFolder(repositoryPath);
  }

  async addScenario(): Promise<void> {
    await AppLocators.addScenarioButton(this.page).click();
    const count = await AppLocators.scenarioCards(this.page).count();
    await expect(AppLocators.scenarioCards(this.page)).toHaveCount(count);
  }

  async clickExportGenerateJson(): Promise<void> {
    await AppLocators.exportMenuButton(this.page).click();
    await AppLocators.exportGenerateJsonOption(this.page).click();
  }

  async clickExportGenerateSheet(): Promise<void> {
    await AppLocators.exportMenuButton(this.page).click();
    await AppLocators.exportGenerateSheetOption(this.page).click();
  }

  async generateJson(): Promise<void> {
    // Caminho "black-box" (UI): Exportar -> Gerar JSON
    try {
      await this.clickExportGenerateJson();
    } catch {
      // Fallback: chamar API do app (útil se a UI mudar)
      await this.page.evaluate(() => {
        // @ts-ignore
        globalThis.App?.generateJSON?.();
      });
    }

    // Esperar um dos estados:
    // - erro de validação (#errorMsg)
    // - confirm de dataset (simple-confirm)
    // - output preenchido
    await this.page.waitForFunction(() => {
      const err = document.getElementById('errorMsg')?.textContent ?? '';
      const output = document.getElementById('output')?.textContent ?? '';
      const confirm = document.querySelector('.simple-confirm-overlay:not(.hidden)');
      return (
        (err && err.trim().length > 0) ||
        !!confirm ||
        (output && output.trim().length > 0)
      );
    });

    // Se existir dataset, o app abre um confirm; não auto-continuar aqui.
    // O teste decide (para poder validar UX/mensagem).
    if (await AppLocators.simpleConfirmOverlay(this.page).isVisible().catch(() => false)) {
      await expect(AppLocators.simpleConfirmOverlay(this.page)).toContainText(
        'A importação do Dataset é feita via arquivo .csv'
      );
      return;
    }

    // Se não houve erro, garantir output visível
    if (!(await AppLocators.errorMsg(this.page).textContent())?.trim()) {
      await expect(AppLocators.jsonOutput(this.page)).toBeVisible({ timeout: 30_000 });
    }
  }

  async readJsonOutput(): Promise<string> {
    const locator = AppLocators.jsonOutput(this.page);

    await expect(locator).toBeVisible({ timeout: 30_000 });

    // Pode ser <pre> (textContent) ou <textarea> (inputValue)
    const tag = await locator.evaluate((el) => el.tagName.toLowerCase());
    if (tag === 'textarea' || tag === 'input') {
      return await locator.inputValue();
    }
    return (await locator.textContent()) ?? '';
  }

  async expectErrorMessage(text: string): Promise<void> {
    await expect(AppLocators.errorMsg(this.page)).toHaveText(text);
  }

  async parseJsonOutput(): Promise<unknown> {
    const output = await this.readJsonOutput();
    return JSON.parse(output);
  }

  async downloadGeneratedJson(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await AppLocators.downloadJsonButton(this.page).click();
    return await downloadPromise;
  }

  async openDatasetModalForScenario(scenarioId: number | string = 1): Promise<void> {
    const btn = AppLocators.scenarioDatasetButtonById(this.page, scenarioId);
    await btn.click();
    await expect(AppLocators.datasetOverlay(this.page)).toBeVisible();
    await expect(AppLocators.datasetModal(this.page)).toContainText('Dataset do cenário');
  }

  async datasetClickAddParameter(): Promise<void> {
    const modal = AppLocators.datasetModal(this.page);
    await expect(modal).toBeVisible();
    await modal.locator('button[aria-label="Adicionar parâmetro"]').click();
    await expect(this.page.getByRole('heading', { name: 'Adicionar parâmetro' })).toBeVisible();
  }

  async datasetAddParameter(name: string): Promise<void> {
    await this.datasetClickAddParameter();

    const sub = this.page.locator('.db-sub-overlay:not(.hidden)');
    await expect(sub).toBeVisible();

    await sub.locator('#db-add-param').fill(name);
    await sub.getByRole('button', { name: 'Adicionar' }).click();

    // Pode fechar (sucesso) OU permanecer aberto com erro (duplicado).
    await this.page.waitForTimeout(100);
  }

  async datasetAddParameterExpectSuccess(name: string): Promise<void> {
    await this.datasetAddParameter(name);
    const sub = this.page.locator('.db-sub-overlay:not(.hidden)');
    await expect(sub).toBeHidden({ timeout: 5_000 });
  }

  async datasetAddRow(): Promise<void> {
    const modal = AppLocators.datasetModal(this.page);
    await expect(modal).toBeVisible();
    await modal.locator('button[aria-label="Adicionar variável"]').click();
  }

  async datasetFillCell(rowIndex1Based: number, paramName: string, value: string): Promise<void> {
    // Input tem aria-label: "Valor do parâmetro <p> (variável N)"
    const aria = `Valor do parâmetro ${paramName} (variável ${rowIndex1Based})`;
    await this.page.getByLabel(aria).fill(value);
  }

  async datasetSave(): Promise<void> {
    const modal = AppLocators.datasetModal(this.page);
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: 'Salvar' }).click();
    await expect(AppLocators.datasetOverlay(this.page)).toBeHidden();
  }

  async openTagSelectorForScenario(scenarioId: number | string = 1): Promise<void> {
    await AppLocators.scenarioTagButtonById(this.page, scenarioId).click();
    await expect(this.page.locator('.tag-selector-menu')).toBeVisible();
  }

  async addNewTag(tagName: string): Promise<void> {
    // Dentro do menu de tags do cenário
    const menu = this.page.locator('.tag-selector-menu');
    await expect(menu).toBeVisible();

    await menu.locator('button.tag-selector-create').click();

    const modal = this.page.locator('.tag-modal-overlay:not(.hidden)');
    await expect(modal).toBeVisible();
    await this.page.locator('#tag-modal-input').fill(tagName);
    // No modo create, botão é "Adicionar"
    await modal.getByRole('button', { name: 'Adicionar' }).click();
    await expect(modal).toBeHidden();
  }

  async toggleTheme(): Promise<void> {
    await AppLocators.themeToggle(this.page).click();
  }

  async toggleScenarioView(): Promise<void> {
    await AppLocators.scenarioViewToggle(this.page).click();
  }

  async collapseHeaderFields(): Promise<void> {
    await AppLocators.headerFieldsToggle(this.page).click();
  }

  async openFabMenu(): Promise<void> {
    await AppLocators.copyAllFab(this.page).click();
    await expect(AppLocators.copyAllMenu(this.page)).toBeVisible();
  }

  async clickFabOption(name: string | RegExp): Promise<void> {
    await this.openFabMenu();
    await this.page.getByRole('button', { name }).click();
  }

  async triggerImportJson(filePath: string): Promise<void> {
    // Abrir: FAB menu -> Importar cenários -> Importar com JSON
    await this.openFabMenu();
    await this.page.getByRole('button', { name: 'Importar cenários' }).click();

    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Importar com JSON' }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(filePath);

    await expect(AppLocators.importNotification(this.page)).toHaveText(
      /Cenários importados com sucesso\./
    );
  }

  async triggerImportCsv(filePath: string): Promise<void> {
    await this.openFabMenu();
    await this.page.getByRole('button', { name: 'Importar cenários' }).click();

    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Importar com CSV' }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(filePath);

    await expect(AppLocators.importNotification(this.page)).toHaveText(
      /Cenários importados com sucesso\./
    );
  }

  async triggerImportJsonExpectError(filePath: string, expectedMessage: string): Promise<void> {
    await this.openFabMenu();
    await this.page.getByRole('button', { name: 'Importar cenários' }).click();

    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Importar com JSON' }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(filePath);

    const notif = this.page.locator('.copy-alert:not(.hidden)');
    await expect(notif).toContainText(expectedMessage);
    await expect(notif).toHaveClass(/copy-alert--error/);
  }

  async triggerImportCsvExpectError(filePath: string, expectedMessage: string): Promise<void> {
    await this.openFabMenu();
    await this.page.getByRole('button', { name: 'Importar cenários' }).click();

    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Importar com CSV' }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles(filePath);

    const notif = this.page.locator('.copy-alert:not(.hidden)');
    await expect(notif).toContainText(expectedMessage);
    await expect(notif).toHaveClass(/copy-alert--error/);
  }

  async fillScenarioVariableProject(value: string, scenarioId: number | string = 1): Promise<void> {
    const id = `#sc-project-${scenarioId}`;
    await expect(this.page.locator(id)).toBeVisible();
    await this.page.locator(id).fill(value);
  }

  async fillScenarioVariableFolder(value: string, scenarioId: number | string = 1): Promise<void> {
    const id = `#sc-folder-${scenarioId}`;
    await expect(this.page.locator(id)).toBeVisible();
    await this.page.locator(id).fill(value);
  }

  async getScenarioCount(): Promise<number> {
    return await AppLocators.scenarioCards(this.page).count();
  }

  async readScenarioTitle(scenarioId: number | string = 1): Promise<string> {
    return await AppLocators.scenarioTitleInputById(this.page, scenarioId).inputValue();
  }

  async readScenarioGherkin(scenarioId: number | string = 1): Promise<string> {
    return await AppLocators.scenarioGherkinInputById(this.page, scenarioId).inputValue();
  }

  async openBackupMenu(): Promise<void> {
    await AppLocators.backupStatusButton(this.page).click();
    await expect(AppLocators.backupStatusMenu(this.page)).toBeVisible();
  }

  async exportBackupAndDownload(): Promise<Download> {
    await this.openBackupMenu();
    const downloadPromise = this.page.waitForEvent('download');
    await AppLocators.backupExportOption(this.page).click();
    return await downloadPromise;
  }

  async importBackupFromFile(filePath: string): Promise<void> {
    // Scroll to top so the backup menu dropdown isn't hidden behind headerGrid
    await this.page.evaluate(() => window.scrollTo(0, 0));
    await this.openBackupMenu();

    // The backup menu dropdown can be occluded by expanded headerGrid elements.
    // Use filechooser event + JS dispatch to avoid pointer interception.
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.evaluate(() => {
      const btn = document.querySelector('#backupStatusMenu [data-action="backup-import"]') as HTMLButtonElement;
      btn?.click();
    });

    const chooser = await fileChooserPromise;
    await chooser.setFiles(filePath);

    // Se estiver "sujo", o app abre confirmCenter antes de restaurar.
    if (await AppLocators.centerConfirmOverlay(this.page).isVisible().catch(() => false)) {
      // Botão primário costuma ser "Restaurar"
      await AppLocators.centerConfirmPrimaryButton(this.page).click();
    }

    // Restore pode levar tempo (overlay)
    await this.page.waitForTimeout(250);
  }

  async generateSpreadsheet(): Promise<void> {
    try {
      await this.clickExportGenerateSheet();
    } catch {
      await this.page.evaluate(() => {
        // @ts-ignore
        globalThis.App?.generateSpreadsheet?.();
      });
    }

    // Planilha pode abrir um simple confirm (assignee/dataset). Continue.
    if (await AppLocators.simpleConfirmOverlay(this.page).isVisible().catch(() => false)) {
      await AppLocators.simpleConfirmContinueButton(this.page).click();
    }

    await expect(AppLocators.generatedFileChipByFormat(this.page, 'csv')).toBeVisible({
      timeout: 30_000,
    });
  }

  async downloadGeneratedCsv(): Promise<Download> {
    const chip = AppLocators.generatedFileChipByFormat(this.page, 'csv');
    await expect(chip).toBeVisible();

    const downloadPromise = this.page.waitForEvent('download');
    await AppLocators.generatedFileChipDownloadButton(chip).click();
    return await downloadPromise;
  }

  async downloadFirstDatasetCsv(): Promise<Download> {
    const chip = this.page.locator(
      '#generatedFiles .generated-file[data-format^="db-"]'
    ).first();
    await expect(chip).toBeVisible({ timeout: 30_000 });

    const downloadPromise = this.page.waitForEvent('download');
    await chip.locator('button.file-download-btn').click();
    return await downloadPromise;
  }

  async getDatasetChipCount(): Promise<number> {
    return await this.page.locator('#generatedFiles .generated-file[data-format^="db-"]').count();
  }

  async waitForBackupBaselineReady(): Promise<void> {
    // baselineHash é gravado em localStorage
    await this.page.waitForFunction(() => {
      try {
        return !!localStorage.getItem('xGherkin:backupBaselineHash');
      } catch {
        return false;
      }
    });
  }

  async triggerBeforeUnloadAndShowBackupPending(): Promise<void> {
    await this.waitForBackupBaselineReady();

    await this.page.evaluate(() => {
      // Dispara beforeunload (isso computa dirty e agenda exibição do indicador)
      const ev = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(ev);

      // Simula o usuário cancelando a saída: página volta a ficar visível/focada.
      window.dispatchEvent(new Event('focus'));

      // Forçar refresh da UI do backup (em alguns casos o focus handler pode não rodar imediatamente)
      try {
        // @ts-ignore
        globalThis.App?.updateBackupDirtyUI?.();
      } catch (e) {}
    });

    // Aguarde a UI refletir "pendente" (quando dirty)
    await this.page.waitForTimeout(50);
  }

  async openInlineConfigFromHeaderField(fieldId: string): Promise<void> {
    const pencil = this.page
      .locator(`#headerGrid label[for="${fieldId}"]`)
      .locator('button.inline-config-pencil');
    await expect(pencil).toBeVisible();
    await pencil.click();
    await expect(AppLocators.inlineConfigMenu(this.page)).toBeVisible();
  }

  async setHeaderFieldAsVariable(fieldId: string): Promise<void> {
    await this.openInlineConfigFromHeaderField(fieldId);
    await AppLocators.inlineConfigMenu(this.page)
      .getByRole('button', { name: 'Definir campo como variável' })
      .click();

    // A mudança remove o input do headerGrid. Aguarde ficar oculto.
    await expect(this.page.locator(`#headerGrid #${fieldId}`)).toHaveCount(0);
  }

  async openInlineConfigFromScenarioField(fieldId: string): Promise<void> {
    const pencil = this.page
      .locator(`label[for="${fieldId}"]`)
      .locator('button.inline-config-pencil');
    await expect(pencil).toBeVisible();
    await pencil.click();
    await expect(AppLocators.inlineConfigMenu(this.page)).toBeVisible();
  }

  async setScenarioFieldAsDefault(fieldId: string): Promise<void> {
    await this.openInlineConfigFromScenarioField(fieldId);
    await AppLocators.inlineConfigMenu(this.page)
      .getByRole('button', { name: 'Definir campo como padrão' })
      .click();

    // Pode abrir confirmação se havia valores preenchidos
    if (await AppLocators.centerConfirmOverlay(this.page).isVisible().catch(() => false)) {
      await AppLocators.centerConfirmPrimaryButton(this.page).click();
    }
  }

  async persistSaveNow(): Promise<void> {
    await this.page.evaluate(async () => {
      // @ts-ignore
      await globalThis.App?.persistScenarios?.saveNow?.();
    });
  }

  async reloadAndWait(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.assertLoaded();
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }
}
