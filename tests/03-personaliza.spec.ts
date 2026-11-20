import { test, expect } from '../src/fixtures/pages.fixture';
import { LOAN_TERMS, minimalSimulation } from '../src/data/simulationData';
import { toCurrency } from '../src/utils/formatters';

test.describe('Paso 3 - Personaliza', () => {
  test.beforeEach(async ({ flow }) => {
    await flow.goToStep(3, minimalSimulation);
  });

  test('muestra monto, plazo, tipo de cuota y textos de ayuda', async ({ personalizeStep }) => {
    await personalizeStep.expectLoaded();
    await expect(personalizeStep.loanAmountInput).toBeVisible();
    await expect(personalizeStep.loanAmountHint).toBeVisible();
    await expect(personalizeStep.loanTermSelect.locator('option')).toHaveText(['Seleccione', ...LOAN_TERMS]);
    await expect(personalizeStep.loanTermHint).toBeVisible();
    await expect(personalizeStep.paymentRadio('fija')).toBeAttached();
    await expect(personalizeStep.paymentRadio('variable')).toBeAttached();
  });

  test('"Siguiente" está deshabilitado hasta completar el formulario', async ({ personalizeStep }) => {
    await expect(personalizeStep.nextButton).toBeDisabled();
    await personalizeStep.selectLoanTerm('20');
    await personalizeStep.selectPaymentType('fija');
    await expect(personalizeStep.nextButton).toBeDisabled();
    await personalizeStep.fillLoanAmount(150000);
    await expect(personalizeStep.nextButton).toBeEnabled();
  });

  test('formatea el monto del préstamo como moneda', async ({ personalizeStep }) => {
    await personalizeStep.fillLoanAmount(250000);
    await expect(personalizeStep.loanAmountInput).toHaveValue(toCurrency(250000));
  });

  test('el tipo de cuota fija/variable es excluyente', async ({ personalizeStep }) => {
    await personalizeStep.selectPaymentType('fija');
    await personalizeStep.selectPaymentType('variable');
    await expect(personalizeStep.paymentRadio('variable')).toBeChecked();
    await expect(personalizeStep.paymentRadio('fija')).not.toBeChecked();
  });

  test('"Volver" regresa al paso Finanzas', async ({ personalizeStep, financesStep }) => {
    await personalizeStep.back();
    await financesStep.expectLoaded();
  });

  test('con datos completos avanza al paso Resultados', async ({ personalizeStep, resultsStep }) => {
    await personalizeStep.fill(minimalSimulation.personalize);
    await personalizeStep.next();
    await resultsStep.expectLoaded();
  });
});
