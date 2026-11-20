import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://brave-mud-0605ba20f.3.azurestaticapps.net/';

// PW_CHANNEL=bundled usa el Chromium descargado por `npx playwright install chromium`.
const channelEnv = process.env.PW_CHANNEL ?? 'chrome';
const channel = channelEnv === 'bundled' ? undefined : channelEnv;

// Evita que la extensión de VS Code ("Show browser") reutilice un navegador compartido que queda abierto:
// cada worker lanza su propio navegador y Playwright lo cierra al terminar la ejecución.
delete process.env.PW_TEST_REUSE_CONTEXT;
delete process.env.PW_TEST_CONNECT_WS_ENDPOINT;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['json', { outputFile: 'reports/json/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    locale: 'es-EC',
    viewport: { width: 1280, height: 720 },
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    screenshot: 'on',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: Number(process.env.SLOW_MO ?? 1200),
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel, viewport: { width: 1280, height: 720 } },
    },
  ],
});
