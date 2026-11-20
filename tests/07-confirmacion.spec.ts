import { test, expect } from '../src/fixtures/pages.fixture';
import { SIMULATION_CODE_PATTERN, fullSimulation } from '../src/data/simulationData';
import { toCurrency, toCurrencyNoDecimals } from '../src/utils/formatters';
import { mockSimulationApi } from '../src/utils/apiMock';

test.describe('Paso 7 - Confirmación', () => {
  test.beforeEach(async ({ flow }) => {
    await flow.goToStep(7, fullSimulation);
  });

  test('muestra mensaje de éxito y código de simulación', async ({ confirmationStep }) => {
    await confirmationStep.expectLoaded();
    await expect(confirmationStep.readyMessage).toBeVisible();
    await expect(confirmationStep.simulationCode).toHaveText(SIMULATION_CODE_PATTERN);
    await expect(confirmationStep.summaryTitle).toBeVisible();
  });

  test('el resumen refleja los datos ingresados en todos los pasos', async ({ confirmationStep }) => {
    const { project, finance, personalize, capabilities, contact } = fullSimulation;
    const expected: Record<string, string> = {
      '¿Edificas solo o en pareja?': project.applicationType,
      '¿Qué tipo de vivienda buscas?': project.housingType,
      '¿En qué ciudad?': project.city,
      '¿Cuánto cuesta aproximadamente?': `${toCurrencyNoDecimals(project.priceMin!)} - ${toCurrencyNoDecimals(project.priceMax!)}`,
      '¿Cuál es tu situación laboral?': finance.laborSituation,
      '¿Cuánto ganas al mes después de impuestos?': toCurrency(finance.monthlyNetIncome),
      '¿Cuánto tienes ahorrado para la cuota inicial?': toCurrency(finance.savings),
      '¿Cuál es tu fecha de nacimiento?': finance.birthDate,
      '¿Estado civil?': finance.maritalStatus,
      '¿Qué monto deseas pedir prestado?': toCurrency(personalize.loanAmount),
      '¿En cuántos años quieres pagarlo?': `${personalize.loanTermYears} años`,
      '¿Qué tipo de cuota prefieres?': personalize.paymentType,
      'Nombre completo': capabilities!.fullName,
      'Tu cédula': capabilities!.cedula,
      'Correo electrónico / Email': capabilities!.email,
      'Teléfono celular': capabilities!.phone,
      '¿Cuántas personas dependen económicamente de ti?': String(capabilities!.dependents),
      '¿Dónde trabajas?': capabilities!.workplace,
      '¿Cuál es el mejor horario para llamarte?': contact.preferredTime,
      '¿Cómo prefieres que te contactemos?': contact.contactMethod,
    };

    for (const [label, value] of Object.entries(expected)) {
      await test.step(`Resumen: ${label} = ${value}`, async () => {
        expect.soft(await confirmationStep.getSummaryValue(label)).toBe(value);
      });
    }
  });

  test('"Aceptar y Enviar" se habilita solo al confirmar la información', async ({ confirmationStep }) => {
    await expect(confirmationStep.submitButton).toBeDisabled();
    await confirmationStep.confirmInformation();
    await expect(confirmationStep.submitButton).toBeEnabled();
  });

  test('envío exitoso: muestra modal de confirmación y envía el payload correcto', async ({ page, confirmationStep, projectStep }) => {
    const captured = await mockSimulationApi(page, { body: { success: true, message: 'Simulación procesada correctamente' } });
    const code = (await confirmationStep.simulationCode.innerText()).trim();

    await confirmationStep.confirmInformation();
    await confirmationStep.submit();

    await expect(confirmationStep.modalTitle).toHaveText('¡Simulación Enviada!');
    await expect(confirmationStep.modalMessage).toHaveText('Simulación procesada correctamente');
    await expect(confirmationStep.modalServerResponse).toContainText('"success": true');

    await test.step('Validar payload enviado al backend', async () => {
      const payload = captured.payload!;
      expect(captured.request!.method()).toBe('POST');
      expect(payload.project).toMatchObject({
        applicationType: fullSimulation.project.applicationType,
        housingType: fullSimulation.project.housingType,
        selectedCity: fullSimulation.project.city,
      });
      expect(payload.finance).toMatchObject({
        laborSituation: fullSimulation.finance.laborSituation,
        monthlyNetIncome: fullSimulation.finance.monthlyNetIncome,
        initialPaymentSavings: fullSimulation.finance.savings,
        birthDate: fullSimulation.finance.birthDate,
        maritalStatus: fullSimulation.finance.maritalStatus,
      });
      expect(payload.personalize).toMatchObject({
        loanAmount: fullSimulation.personalize.loanAmount,
        loanTermYears: fullSimulation.personalize.loanTermYears,
        paymentType: fullSimulation.personalize.paymentType,
      });
      expect(payload.capacities).toMatchObject({ ...fullSimulation.capabilities! });
      expect(payload.contactPreferences).toMatchObject({ ...fullSimulation.contact });
      expect(payload.summaryConfirmation).toMatchObject({ confirmInformationCorrect: true, simulationCode: code });
    });

    await confirmationStep.acceptModal();
    await projectStep.expectLoaded();
  });

  test('envío con error del servidor: muestra modal de error', async ({ page, confirmationStep }) => {
    await mockSimulationApi(page, { status: 500, body: { message: 'Internal Server Error' } });
    await confirmationStep.confirmInformation();
    await confirmationStep.submit();
    await expect(confirmationStep.modalTitle).toHaveText('Error en el Envío');
    await expect(confirmationStep.modalMessage).toContainText('Internal Server Error');
  });

  test('"Cancelar" reinicia el simulador en el paso Proyecto', async ({ confirmationStep, projectStep }) => {
    await confirmationStep.cancel();
    await projectStep.expectLoaded();
  });

  test('"Volver" regresa al paso Contacto', async ({ confirmationStep, contactStep }) => {
    await confirmationStep.back();
    await contactStep.expectLoaded();
  });
});
