import { Page, Request } from '@playwright/test';

export const SIMULATION_API = '**/api/Simulacion/procesar';

export interface CapturedRequest {
  request?: Request;
  /** Payload deserializado (la app envía { data: "<json string>" }). */
  payload?: Record<string, any>;
}

export async function mockSimulationApi(
  page: Page,
  options: { status?: number; body?: unknown } = {},
): Promise<CapturedRequest> {
  const captured: CapturedRequest = {};
  const status = options.status ?? 200;
  const body = options.body ?? { success: true, message: 'Simulación procesada correctamente' };

  await page.route(SIMULATION_API, async (route) => {
    captured.request = route.request();
    const raw = route.request().postDataJSON() as { data?: string } | null;
    captured.payload = raw?.data ? JSON.parse(raw.data) : (raw ?? undefined);
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });

  return captured;
}
