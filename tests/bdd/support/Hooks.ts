import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import type { Browser, BrowserContext, Page } from 'playwright';
import type { CustomWorld } from './World.js';

const headless = (process.env.HEADLESS ?? '1') === '1';
const silenceTailwindCdnWarning =
  (process.env.SILENCE_TAILWIND_CDN_WARNING ?? '1') === '1';

const DEFAULT_VIEWPORT = { width: 1280, height: 720 };

// ── Sessão compartilhada ──────────────────────────────────────────
// O browser é lançado uma única vez (BeforeAll) e reutilizado em todos
// os cenários. Context + Page são mantidos entre cenários e só recriados
// quando estritamente necessário (falha ou viewport alterado).
// Os Backgrounds dos .feature já cuidam do isolamento da aplicação via
// hardResetAppState() (limpa localStorage, sessionStorage e IndexedDB).
// ──────────────────────────────────────────────────────────────────

let sharedBrowser: Browser | null = null;
let sharedContext: BrowserContext | null = null;
let sharedPage: Page | null = null;
let needsNewContext = true;

async function ensureBrowser(): Promise<Browser> {
  if (!sharedBrowser || !sharedBrowser.isConnected()) {
    await sharedBrowser?.close().catch(() => {});
    sharedBrowser = await chromium.launch({ headless });
    needsNewContext = true;
  }
  return sharedBrowser;
}

async function createContext(browser: Browser): Promise<{ context: BrowserContext; page: Page }> {
  await sharedPage?.close().catch(() => {});
  await sharedContext?.close().catch(() => {});

  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: DEFAULT_VIEWPORT,
  });

  const page = await context.newPage();

  if (silenceTailwindCdnWarning) {
    await page.addInitScript(() => {
      const suppressed = 'cdn.tailwindcss.com should not be used in production';
      const originalWarn = console.warn.bind(console);
      console.warn = (...args: unknown[]) => {
        const first = args[0];
        if (typeof first === 'string' && first.includes(suppressed)) return;
        return originalWarn(...args);
      };
    });
  }

  sharedContext = context;
  sharedPage = page;
  needsNewContext = false;

  return { context, page };
}

// ── Hooks ─────────────────────────────────────────────────────────

BeforeAll(async function () {
  sharedBrowser = await chromium.launch({ headless });
});

Before(async function (this: CustomWorld) {
  const browser = await ensureBrowser();

  if (needsNewContext || !sharedContext || !sharedPage) {
    await createContext(browser);
  }

  this.browser = browser;
  this.context = sharedContext!;
  this.page = sharedPage!;
});

After(async function (this: CustomWorld, scenario) {
  try {
    if (scenario.result?.status === Status.FAILED && this.page) {
      const png = await this.page.screenshot({ fullPage: true });
      await this.attach(png, 'image/png');
      // Após falha, forçar novo context para garantir estado limpo
      needsNewContext = true;
    }
  } catch {
    needsNewContext = true;
  }

  // Restaurar viewport padrão se foi alterado durante o cenário (ex.: overlay mobile)
  if (this.page && !needsNewContext) {
    try {
      const vp = this.page.viewportSize();
      if (vp && (vp.width !== DEFAULT_VIEWPORT.width || vp.height !== DEFAULT_VIEWPORT.height)) {
        await this.page.setViewportSize(DEFAULT_VIEWPORT);
      }
    } catch {
      needsNewContext = true;
    }
  }

});

AfterAll(async function () {
  await sharedPage?.close().catch(() => {});
  await sharedContext?.close().catch(() => {});
  await sharedBrowser?.close().catch(() => {});
  sharedBrowser = null;
  sharedContext = null;
  sharedPage = null;
});
