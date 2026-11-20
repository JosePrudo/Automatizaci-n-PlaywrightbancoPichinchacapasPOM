import { test, expect } from '../src/fixtures/pages.fixture';
import { MARITAL_STATUS_OPTIONS, minimalSimulation } from '../src/data/simulationData';
import { toCurrency } from '../src/utils/formatters';

test.describe('Paso 2 - Finanzas', () => {
  test.beforeEach(async ({ flow }) => {
    await flow.goToStep(2, minimalSimulation);
  });

  test('muestra los campos de situación financiera', async ({ financesStep }) => {
    await financesStep.expectLoaded();
    for (const type of ['empleado', 'independiente', 'empresario'] as const) {
      await expect(financesStep.laborRadio(type)).toBeAttached();
    }
    await expect(financesStep.incomeInput).toBeVisible();
    await expect(financesStep.savingsInput).toBeVisible();
    await expect(financesStep.birthDateInput).toBeVisible();
    await expect(financesStep.maritalStatusSelect.locator('option')).toHaveText(['Seleccione', ...MARITAL_STATUS_OPTIONS]);
    await expect(financesStep.maritalStatusHint).toBeVisible();
  });

  test('"Siguiente" se habilita con situación laboral, ingresos y ahorros', async ({ financesStep }) => {
    const data = minimalSimulation.finance;
    await expect(financesStep.nextButton).toBeDisabled();
    await financesStep.selectLaborSituation(data.laborSituation);
    await expect(financesStep.nextButton).toBeDisabled();
    await financesStep.fillIncome(data.monthlyNetIncome);
    await expect(financesStep.nextButton).toBeDisabled();
    await financesStep.fillSavings(data.savings);
    // Fecha de nacimiento y estado civil no bloquean el avance (comportamiento actual de la app).
    await expect(financesStep.nextButton).toBeEnabled();
  });

  test('formatea ingresos y ahorros como moneda', async ({ financesStep }) => {
    await financesStep.fillIncome(3500);
    await financesStep.fillSavings(45000);
    await expect(financesStep.incomeInput).toHaveValue(toCurrency(3500));
    await expect(financesStep.savingsInput).toHaveValue(toCurrency(45000));
  });

  test('"Guardar formulario" mantiene al usuario en el paso actual', async ({ financesStep }) => {
    await financesStep.fill(minimalSimulation.finance);
    await financesStep.save();
    await financesStep.expectLoaded();
  });

  test('"Volver" regresa al paso Proyecto', async ({ financesStep, projectStep }) => {
    await financesStep.back();
    await projectStep.expectLoaded();
  });

  test('con datos completos avanza al paso Personaliza', async ({ financesStep, personalizeStep }) => {
    await financesStep.fill(minimalSimulation.finance);
    await financesStep.next();
    await personalizeStep.expectLoaded();
  });
});
