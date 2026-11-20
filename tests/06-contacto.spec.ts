import { test, expect } from '../src/fixtures/pages.fixture';
import { minimalSimulation } from '../src/data/simulationData';

test.describe('Paso 6 - Contacto', () => {
  test.beforeEach(async ({ flow }) => {
    await flow.goToStep(6, minimalSimulation);
  });

  test('muestra horario, medio de contacto y políticas con sus valores por defecto', async ({ contactStep }) => {
    await contactStep.expectLoaded();
    for (const time of ['mañana', 'tarde'] as const) {
      await expect(contactStep.preferredTimeRadio(time)).toBeVisible();
    }
    for (const method of ['llamada', 'correo', 'whatsapp'] as const) {
      await expect(contactStep.contactMethodRadio(method)).toBeVisible();
    }
    await expect(contactStep.privacyPolicyCheck).toBeChecked();
    await expect(contactStep.productInfoCheck).not.toBeChecked();
  });

  test('el horario preferido es excluyente', async ({ contactStep }) => {
    await contactStep.preferredTimeRadio('mañana').check();
    await contactStep.preferredTimeRadio('tarde').check();
    await expect(contactStep.preferredTimeRadio('tarde')).toBeChecked();
    await expect(contactStep.preferredTimeRadio('mañana')).not.toBeChecked();
  });

  test('el medio de contacto es excluyente', async ({ contactStep }) => {
    for (const method of ['llamada', 'correo', 'whatsapp'] as const) {
      await contactStep.contactMethodRadio(method).check();
      await expect(contactStep.contactMethodRadio(method)).toBeChecked();
    }
    await expect(contactStep.contactMethodRadio('llamada')).not.toBeChecked();
    await expect(contactStep.contactMethodRadio('correo')).not.toBeChecked();
  });

  test('permite marcar y desmarcar las casillas de políticas', async ({ contactStep }) => {
    await contactStep.privacyPolicyCheck.check();
    await contactStep.productInfoCheck.check();
    await expect(contactStep.privacyPolicyCheck).toBeChecked();
    await expect(contactStep.productInfoCheck).toBeChecked();
    await contactStep.productInfoCheck.uncheck();
    await expect(contactStep.productInfoCheck).not.toBeChecked();
  });

  test('"Volver" regresa al paso Capacidades', async ({ contactStep, capabilitiesStep }) => {
    await contactStep.back();
    await capabilitiesStep.expectLoaded();
  });

  test('con datos completos avanza al paso Confirmación', async ({ contactStep, confirmationStep }) => {
    await contactStep.fill(minimalSimulation.contact);
    await contactStep.next();
    await confirmationStep.expectLoaded();
  });
});
