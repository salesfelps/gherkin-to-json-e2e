/**
 * Cucumber config.
 *
 * Observação: este repo é ESM ("type": "module"), então usamos um arquivo .cjs para
 * manter a configuração em CommonJS, enquanto os steps/support estão em TypeScript (ESM)
 * via loader do ts-node.
 */

module.exports = {
  default: {
    paths: ['tests/bdd/features/**/*.feature'],

    // Carrega TypeScript em runtime (ESM)
    loader: ['ts-node/esm'],

    // Support/steps/pages em TS (executados via "import")
    import: [
      'tests/bdd/support/**/*.ts',
      'tests/bdd/pages/**/*.ts',
      'tests/bdd/steps/**/*.ts',
    ],

    // Relatórios
    format: [
      'progress',
      'html:reports/cucumber.html',
      'json:reports/cucumber.json',
    ],

    // Evita o prompt de publish do Cucumber Reports
    publishQuiet: true,
  },
};
