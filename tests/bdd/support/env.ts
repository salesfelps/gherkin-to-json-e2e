import path from 'node:path';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export type AppEnvName = 'prod' | 'local';

export type AppEnvConfig = {
  name: AppEnvName;
  /** Base URL do app (pode ser http(s):// ou file://) */
  baseUrl: string;
};

const PROD: AppEnvConfig = {
  name: 'prod',
  baseUrl: 'https://gherkin2json.wefit.com.br/',
};

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/';
}

function buildFileBaseUrl(publicDir: string): string {
  // Garantir que a URL aponte para um diretório (termina com /)
  const abs = path.resolve(publicDir);
  // pathToFileURL exige um path; com trailing separator a URL termina com '/'
  const dirUrl = pathToFileURL(abs + path.sep).toString();
  return ensureTrailingSlash(dirUrl);
}

function resolveLocalPublicDir(): string {
  // 1) Preferência: app dentro deste workspace (facilita rodar local sem dependências externas)
  const workspaceBundled = path.resolve(
    process.cwd(),
    'gherkin-to-json-converter',
    'public'
  );

  // 2) Fallback: caminho legacy do README (máquinas onde o app está fora do repo E2E)
  const legacy = path.resolve('C:/VSCode/gherkin-to-json-converter/public');

  const hasIndex = (dir: string) => existsSync(path.join(dir, 'index.html'));

  if (hasIndex(workspaceBundled)) return workspaceBundled;
  if (hasIndex(legacy)) return legacy;

  // Último recurso: ainda retorna o do workspace, para manter comportamento previsível.
  return workspaceBundled;
}

const LOCAL: AppEnvConfig = {
  name: 'local',
  // Repare: o Playwright aceita file://, mas precisa terminar com / para usar goto('index.html')
  baseUrl: buildFileBaseUrl(resolveLocalPublicDir()),
};

export function getEnvName(): AppEnvName {
  const raw = (process.env.TEST_ENV ?? 'prod').toLowerCase();
  if (raw === 'local') return 'local';
  return 'prod';
}

export function getEnv(): AppEnvConfig {
  const name = getEnvName();
  const base = name === 'local' ? LOCAL : PROD;

  // Override opcional (útil para apontar para outro host/pasta sem mexer no código)
  const override = process.env.APP_BASE_URL?.trim();
  if (override) {
    return { ...base, baseUrl: ensureTrailingSlash(override) };
  }

  return base;
}
