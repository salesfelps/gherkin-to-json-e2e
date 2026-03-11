import { Before, After, Status } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import type { CustomWorld } from './World.js';

const headless = (process.env.HEADLESS ?? '1') === '1';

Before(async function (this: CustomWorld) {
  this.browser = await chromium.launch({ headless });

  // Aceitar downloads para validar exportações (JSON/CSV/Dataset/Backup).
  // Ajustar viewport default para evitar o overlay de mobile (breakpoint <= 900px).
  this.context = await this.browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1280, height: 720 },
  });

  this.page = await this.context.newPage();

  // (Opcional) Suprimir warning do Tailwind via CDN, como fazíamos no Playwright Test.
  const silenceTailwindCdnWarning =
    (process.env.SILENCE_TAILWIND_CDN_WARNING ?? '1') === '1';

  if (silenceTailwindCdnWarning) {
    await this.page.addInitScript(() => {
      const suppressed = 'cdn.tailwindcss.com should not be used in production';
      const originalWarn = console.warn.bind(console);
      console.warn = (...args) => {
        const first = args[0];
        if (typeof first === 'string' && first.includes(suppressed)) return;
        return originalWarn(...args);
      };
    });
  }
});

After(async function (this: CustomWorld, scenario) {
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const png = await this.page.screenshot({ fullPage: true });
      await this.attach(png, 'image/png');
    }
  } finally {
    await this.page?.close().catch(() => {});
    await this.context?.close().catch(() => {});
    await this.browser?.close().catch(() => {});
  }
});
