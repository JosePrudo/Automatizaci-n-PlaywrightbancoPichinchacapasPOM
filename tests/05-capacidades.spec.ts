import { test, expect } from '../src/fixtures/pages.fixture';
import { fullSimulation, minimalSimulation } from '../src/data/simulationData';

test.describe('Paso 5 - Capacidades', () => {
  test.beforeEach(async ({ flow }) => {
    await flow.goToStep(5, minimalSimulation);
  });

  test('muestra los datos personales y textos de ayuda', async ({ capabilitiesStep }) => {
    await capabilitiesStep.expectLoaded();
    await expect(capabilitiesStep.fullNameInput).toBeVisible();
    await expect(capabilitiesStep.cedulaInput).toBeVisible();
    await expect(capabilitiesStep.emailInput).toHaveAttribute('type', 'email');
    await expect(capabilitiesStep.emailHint).toBeVisible();
    await expect(capabilitiesStep.phoneInput).toHaveAttribute('type', 'tel');
    await expect(capabilitiesStep.authorizeCreditCheck).not.toBeChecked();
    await expect(capabilitiesStep.dependentsInput).toHaveAttribute('type', 'number');
    await expect(capabilitiesStep.workplaceHint).toBeVisible();
  });

  test('permite diligenciar todos los campos', async ({ capabilitiesStep }) => {
    const data = fullSimulation.capabilities!;
    await capabilitiesStep.fill(data);
    await expect(capabilitiesStep.fullNameInput).toHaveValue(data.fullName);
    await expect(capabilitiesStep.cedulaInput).toHaveValue(data.cedula);
    await expect(capabilitiesStep.emailInput).toHaveValue(data.email);
    await expect(capabilitiesStep.phoneInput).toHaveValue(data.phone);
    await expect(capabilitiesStep.authorizeCreditCheck).toBeChecked();
    await expect(capabilitiesStep.dependentsInput).toHaveValue(String(data.dependents));
    await expect(capabilitiesStep.workplaceInput).toHaveValue(data.workplace);
  });

  test('los campos son opcionales: permite continuar sin diligenciarlos', async ({ capabilitiesStep, contactStep }) => {
    await expect(capabilitiesStep.nextButton).toBeEnabled();
    await capabilitiesStep.next();
    await contactStep.expectLoaded();
  });

  test('"Volver" regresa al paso Resultados', async ({ capabilitiesStep, resultsStep }) => {
    await capabilitiesStep.back();
    await resultsStep.expectLoaded();
  });

  test('con datos completos avanza al paso Contacto', async ({ capabilitiesStep, contactStep }) => {
    await capabilitiesStep.fill(fullSimulation.capabilities!);
    await capabilitiesStep.next();
    await contactStep.expectLoaded();
  });
});
