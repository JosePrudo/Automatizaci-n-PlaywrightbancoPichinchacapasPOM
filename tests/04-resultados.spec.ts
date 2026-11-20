import { test, expect } from '../src/fixtures/pages.fixture';
import { minimalSimulation } from '../src/data/simulationData';

test.describe('Paso 4 - Resultados', () => {
  test.beforeEach(async ({ flow }) => {
    await flow.goToStep(4, minimalSimulation);
  });

  test('muestra la información de cuota y seguros', async ({ resultsStep }) => {
    await resultsStep.expectLoaded();
    await expect(resultsStep.description).toBeVisible();
    await expect(resultsStep.realCapacityButton).toBeVisible();
    await expect(resultsStep.nextButton).toBeEnabled();
  });

  test('"¿Quieres conocer tu capacidad real?" lleva al paso Capacidades', async ({ resultsStep, capabilitiesStep }) => {
    await resultsStep.goToRealCapacity();
    await capabilitiesStep.expectLoaded();
  });

  test('"Siguiente" lleva al paso Capacidades', async ({ resultsStep, capabilitiesStep }) => {
    await resultsStep.next();
    await capabilitiesStep.expectLoaded();
  });

  test('"Volver" regresa al paso Personaliza', async ({ resultsStep, personalizeStep }) => {
    await resultsStep.back();
    await personalizeStep.expectLoaded();
  });
});
