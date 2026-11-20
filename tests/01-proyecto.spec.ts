import { test, expect } from '../src/fixtures/pages.fixture';
import { CITIES, STEP_NAMES } from '../src/data/simulationData';
import { toCurrency } from '../src/utils/formatters';

test.describe('Paso 1 - Proyecto', () => {
  test.beforeEach(async ({ wizard }) => {
    await wizard.open();
  });

  test('muestra cabecera, título y el stepper con los 7 pasos', async ({ wizard, projectStep }) => {
    await expect(wizard.logo.first()).toBeVisible();
    await expect(wizard.mainTitle).toBeVisible();
    for (const name of STEP_NAMES) {
      await expect(wizard.stepLabel(name)).toBeVisible();
    }
    await projectStep.expectLoaded();
  });

  test('"Siguiente" está deshabilitado hasta completar los campos obligatorios', async ({ projectStep }) => {
    await expect(projectStep.nextButton).toBeDisabled();
    await projectStep.selectApplicationType('individual');
    await expect(projectStep.nextButton).toBeDisabled();
    await projectStep.selectHousingType('casa');
    await expect(projectStep.nextButton).toBeDisabled();
    await projectStep.selectCity('Quito');
    await expect(projectStep.nextButton).toBeEnabled();
  });

  test('los radios de tipo de solicitud y vivienda son excluyentes', async ({ projectStep }) => {
    await projectStep.selectApplicationType('individual');
    await projectStep.selectApplicationType('pareja');
    await expect(projectStep.applicationRadio('pareja')).toBeChecked();
    await expect(projectStep.applicationRadio('individual')).not.toBeChecked();

    await projectStep.selectHousingType('casa');
    await projectStep.selectHousingType('apartamento');
    await expect(projectStep.housingRadio('apartamento')).toBeChecked();
    await expect(projectStep.housingRadio('casa')).not.toBeChecked();
  });

  test('el combo de ciudad lista todas las ciudades disponibles', async ({ projectStep }) => {
    await expect(projectStep.citySelect.locator('option')).toHaveText(['Seleccione', ...CITIES]);
    for (const city of CITIES) {
      await projectStep.selectCity(city);
      await expect(projectStep.citySelect).toHaveValue(city);
    }
  });

  test('el slider de precio actualiza el rango estimado', async ({ projectStep }) => {
    await expect(projectStep.priceRangeLabel).toHaveText(`${toCurrency(174950)} – ${toCurrency(500000)}`);
    await projectStep.setPriceRange(100000, 300000);
    await expect(projectStep.priceRangeLabel).toHaveText(`${toCurrency(100000)} – ${toCurrency(300000)}`);
  });

  test('no permite saltar pasos desde el stepper', async ({ wizard, projectStep }) => {
    await wizard.goToStepFromStepper('Personaliza');
    await projectStep.expectLoaded();
  });

  test('con datos completos avanza al paso Finanzas', async ({ projectStep, financesStep }) => {
    await projectStep.fill({ applicationType: 'pareja', housingType: 'apartamento', city: 'Cuenca' });
    await projectStep.next();
    await financesStep.expectLoaded();
  });
});
