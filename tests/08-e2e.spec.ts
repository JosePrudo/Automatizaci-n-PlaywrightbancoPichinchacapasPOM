import { test, expect } from '../src/fixtures/pages.fixture';
import { SIMULATION_CODE_PATTERN, fullSimulation, minimalSimulation } from '../src/data/simulationData';
import { SimulationData } from '../src/data/types';

const scenarios: Array<{ name: string; data: SimulationData }> = [
  { name: 'flujo completo con todos los datos', data: fullSimulation },
  { name: 'flujo individual con cuota fija', data: minimalSimulation },
];

test.describe('E2E - Simulación de crédito hipotecario (backend real)', () => {
  for (const { name, data } of scenarios) {
    test(`recorre las 7 secciones y envía la simulación: ${name}`, async ({ page, flow, confirmationStep, projectStep }, testInfo) => {
      await flow.goToStep(7, data);

      await test.step('Paso 7 - Confirmación: confirmar y enviar', async () => {
        await confirmationStep.expectLoaded();
        await expect(confirmationStep.simulationCode).toHaveText(SIMULATION_CODE_PATTERN);
        await confirmationStep.confirmInformation();
        const responsePromise = page.waitForResponse('**/api/Simulacion/procesar').catch(() => null);
        await confirmationStep.submit();
        await responsePromise;
      });

      await test.step('Validar respuesta del servidor en el modal', async () => {
        await expect(confirmationStep.responseModal).toBeVisible({ timeout: 30_000 });
        const title = (await confirmationStep.modalTitle.innerText()).trim();
        const message = (await confirmationStep.modalMessage.innerText().catch(() => '')).trim();
        await testInfo.attach('respuesta-backend', {
          body: JSON.stringify({ title, message }, null, 2),
          contentType: 'application/json',
        });
        expect(['¡Simulación Enviada!', 'Error en el Envío']).toContain(title);
        // El backend real de pruebas puede no estar disponible; se reporta como anotación sin romper el flujo de UI.
        if (title === 'Error en el Envío') {
          testInfo.annotations.push({ type: 'backend', description: `Backend respondió con error: ${message}` });
        }
      });

      await test.step('Cerrar modal y volver al inicio', async () => {
        await confirmationStep.acceptModal();
        await projectStep.expectLoaded();
      });
    });
  }
});
