import type { Page, Locator } from 'playwright';

/**
 * Centraliza locators para deixar POM/steps mais legíveis.
 *
 * Preferimos seletores estáveis (id/data-testid). Em prod a UI atual expõe ids.
 */
export const AppLocators = {
  // Layout / root
  htmlRoot: (page: Page): Locator => page.locator('html'),
  mobileBlockOverlay: (page: Page): Locator => page.locator('#mobileBlockOverlay'),
  appBootOverlay: (page: Page): Locator => page.locator('#appBootOverlay'),

  // Header / toggles
  themeToggle: (page: Page): Locator => page.locator('#themeToggle'),
  scenarioViewToggle: (page: Page): Locator => page.locator('#scenarioViewToggle'),
  headerFieldsToggle: (page: Page): Locator => page.locator('#headerFieldsToggle'),
  headerGrid: (page: Page): Locator => page.locator('#headerGrid'),

  // Backup menu
  backupStatusButton: (page: Page): Locator => page.locator('#backupStatusBtn'),
  backupStatusMenu: (page: Page): Locator => page.locator('#backupStatusMenu'),
  backupExportOption: (page: Page): Locator =>
    page.locator('#backupStatusMenu [data-action="backup-export"]'),
  backupImportOption: (page: Page): Locator =>
    page.locator('#backupStatusMenu [data-action="backup-import"]'),

  // Cenários
  scenariosContainer: (page: Page): Locator => page.locator('#scenarios'),
  scenarioCards: (page: Page): Locator => page.locator('#scenarios .scenario'),
  addScenarioButton: (page: Page): Locator => page.locator('#addScenarioBtn'),
  clearScenariosButton: (page: Page): Locator => page.locator('#clearScenariosBtn'),

  // Cenário #1 (por padrão a página inicia com 1 cenário vazio)
  scenario1TitleInput: (page: Page): Locator => page.locator('#title-1'),

  scenarioTitleInputById: (page: Page, id: string | number): Locator =>
    page.locator(`#title-${id}`),
  scenarioGherkinInputById: (page: Page, id: string | number): Locator =>
    page.locator(`#gherkin-${id}`),
  scenarioMoveUpById: (page: Page, id: string | number): Locator =>
    page.locator(`#title-${id}`).locator('..').locator('xpath=ancestor::*[contains(@class,"scenario")]').locator('.scenario-row-details .move-btn.move-up, .move-btn.move-up').first(),

  scenarioDatasetButtonById: (page: Page, id: string | number): Locator =>
    // Preferir o botão real dentro dos detalhes (.database-btn). O botão proxy do modo linhas
    // (.scenario-row-dataset) pode estar hidden no modo blocos.
    page
      .locator(`#title-${id}`)
      .locator('xpath=ancestor::*[contains(@class,"scenario")]')
      .locator('.scenario-row-details .database-btn, .database-btn')
      .first(),

  scenarioTagButtonById: (page: Page, id: string | number): Locator =>
    page
      .locator(`#title-${id}`)
      .locator('xpath=ancestor::*[contains(@class,"scenario")]')
      .locator('.scenario-tag-wrapper .scenario-tag-btn')
      .first(),

  // Campo principal de entrada do cenário.
  // (Em prod/local: #gherkin-1)
  gherkinInput: (page: Page): Locator =>
    page.locator(
      // Preferência: id estável
      '#gherkin-1, textarea#gherkin-1, '
        + "textarea[placeholder*='cenário' i][placeholder*='Gherkin' i]"
    ),

  // Campos do topo
  // IMPORTANTE: quando um campo está configurado como "variável por cenário",
  // o app remove o input visível do #headerGrid e cria um <input type="hidden"> com o mesmo id no <body>.
  // Para ações/asserts no header visível, use *HeaderGrid* locators.
  projectInput: (page: Page): Locator => page.locator('#project'),
  repositoryFolderInput: (page: Page): Locator => page.locator('#folder'),
  projectHeaderGridInput: (page: Page): Locator => page.locator('#headerGrid #project'),
  repositoryFolderHeaderGridInput: (page: Page): Locator => page.locator('#headerGrid #folder'),
  headerAssigneeInput: (page: Page): Locator => page.locator('#h-assignee'),

  // Bulk
  bulkButton: (page: Page): Locator => page.locator('#bulkBtn'),
  bulkBox: (page: Page): Locator => page.locator('#bulkBox'),
  bulkInput: (page: Page): Locator => page.locator('#bulkInput'),
  bulkConvertButton: (page: Page): Locator => page.locator('#convertBtn'),
  bulkError: (page: Page): Locator => page.locator('#bulkError'),

  // Export menu
  exportMenuButton: (page: Page): Locator => page.locator('#converterBtn'),
  exportMenu: (page: Page): Locator => page.locator('#converterMenu'),
  exportGenerateJsonOption: (page: Page): Locator =>
    page.locator('#converterMenu [data-action="json"]'),
  exportGenerateSheetOption: (page: Page): Locator =>
    page.locator('#converterMenu [data-action="sheet"]'),

  // Errors
  errorMsg: (page: Page): Locator => page.locator('#errorMsg'),

  // JSON output
  resultPanel: (page: Page): Locator => page.locator('#result'),
  jsonOutput: (page: Page): Locator => page.locator('#output'),
  downloadJsonButton: (page: Page): Locator => page.locator('#downloadBtn'),

  // Generated files chips (CSV/dataset)
  generatedFilesContainer: (page: Page): Locator => page.locator('#generatedFiles'),
  generatedFileChips: (page: Page): Locator => page.locator('#generatedFiles .generated-file'),
  generatedFileChipByFormat: (page: Page, format: string): Locator =>
    page.locator(`#generatedFiles .generated-file[data-format="${format}"]`),
  generatedFileChipLabel: (chip: Locator): Locator => chip.locator('.file-label'),
  generatedFileChipName: (chip: Locator): Locator => chip.locator('.file-name'),
  generatedFileChipDownloadButton: (chip: Locator): Locator =>
    chip.locator('button.file-download-btn, button.btn.btn-ghost.file-download-btn'),

  // Simple confirm (dataset/spreadsheet) — implementado em generate.js (classe .simple-confirm-overlay)
  simpleConfirmOverlay: (page: Page): Locator =>
    page.locator('.simple-confirm-overlay:not(.hidden)'),
  simpleConfirmContinueButton: (page: Page): Locator =>
    page.locator('.simple-confirm-overlay:not(.hidden) button.btn.btn-primary', { hasText: 'Continuar' }),

  // Center confirm (inline-config / backup restore / tags delete)
  centerConfirmOverlay: (page: Page): Locator =>
    page.locator('.center-confirm-overlay:not(.hidden):not(.simple-confirm-overlay)'),
  centerConfirmPrimaryButton: (page: Page): Locator =>
    page.locator('.center-confirm-overlay:not(.hidden):not(.simple-confirm-overlay) button.btn.btn-primary'),
  centerConfirmCancelButton: (page: Page): Locator =>
    page.locator('.center-confirm-overlay:not(.hidden):not(.simple-confirm-overlay) button.btn.btn-ghost', { hasText: 'Cancelar' }),

  // Copy-all FAB menu (import/search/bulk edit)
  copyAllFab: (page: Page): Locator => page.locator('#copyAllFab'),
  copyAllMenu: (page: Page): Locator => page.locator('.copy-all-menu'),
  copyAllOptionByName: (page: Page, name: string | RegExp): Locator =>
    page.getByRole('button', { name }),

  // Import notification
  importNotification: (page: Page): Locator => page.locator('.copy-alert:not(.hidden)'),

  // Inline config (variável/padrão)
  inlineConfigMenu: (page: Page): Locator => page.locator('.inline-config-menu'),

  // Dataset modal
  datasetOverlay: (page: Page): Locator => page.locator('.db-overlay:not(.hidden)'),
  datasetModal: (page: Page): Locator => page.locator('.db-modal'),

  // Search & Replace
  searchReplacePanel: (page: Page): Locator => page.locator('.search-replace-panel'),
  searchReplaceSearchInput: (page: Page): Locator =>
    page.locator('.search-replace-panel .search-replace-input').first(),
  searchReplaceReplaceInput: (page: Page): Locator =>
    page.locator('.search-replace-panel .search-replace-input').nth(1),
  searchReplaceCounter: (page: Page): Locator => page.locator('.search-replace-counter'),
  searchReplaceCloseButton: (page: Page): Locator => page.locator('.search-replace-close'),
  searchReplaceAllButton: (page: Page): Locator =>
    page.locator('.search-replace-panel').getByRole('button', { name: /substituir todas/i }),

  // Priority
  scenarioPriorityButtonById: (page: Page, id: string | number): Locator =>
    page
      .locator(`#title-${id}`)
      .locator('xpath=ancestor::*[contains(@class,"scenario")]')
      .locator('.priority-btn')
      .first(),

  // Copy JSON
  copyJsonButton: (page: Page): Locator => page.locator('#copyBtn'),

  // Scenario remove
  scenarioRemoveButtonById: (page: Page, id: string | number): Locator =>
    page
      .locator(`#title-${id}`)
      .locator('xpath=ancestor::*[contains(@class,"scenario")]')
      .locator('.remove-btn')
      .first(),
};
