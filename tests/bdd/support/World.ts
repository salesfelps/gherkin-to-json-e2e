import { setWorldConstructor, World, type IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from 'playwright';
import type { AppEnvConfig } from './env.js';
import { getEnv } from './env.js';

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  env: AppEnvConfig;

  // Test helpers
  lastDownload?: import('playwright').Download;
  lastInvalidImportFile?: string;

  // ephemeral values used within scenarios
  _prevTheme?: string | null;
  _toggledTheme?: string | null;

  constructor(options: IWorldOptions) {
    super(options);
    this.env = getEnv();
  }
}

setWorldConstructor(CustomWorld);
