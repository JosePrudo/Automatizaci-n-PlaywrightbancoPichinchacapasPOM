import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Paso 7 - Confirmación (resumen + envío al backend) */
export class ConfirmationStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Confirmación';
  readonly readyMessage: Locator;
  readonly simulationCode: Locator;
  readonly summaryTitle: Locator;
  readonly confirmInformationCheck: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly responseModal: Locator;
  readonly modalTitle: Locator;
  readonly modalMessage: Locator;
  readonly modalServerResponse: Locator;
  readonly modalAcceptButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-confirmation');
    this.readyMessage = this.root.getByRole('heading', { name: '¡Listo! Te contactaremos pronto' });
    this.simulationCode = this.root.getByText('Código de tu simulación').locator('xpath=following-sibling::div[1]');
    this.summaryTitle = this.root.getByRole('heading', { name: 'Resumen de lo que simulaste' });
    this.confirmInformationCheck = this.root.locator('#confirmInformation');
    this.submitButton = this.root.getByRole('button', { name: 'Aceptar y Enviar' });
    this.cancelButton = this.root.getByRole('button', { name: 'Cancelar', exact: true });
    this.responseModal = page.locator('div.fixed.inset-0').filter({ has: page.locator('h3') });
    this.modalTitle = this.responseModal.locator('h3');
    this.modalMessage = this.responseModal.locator('h3 + p');
    this.modalServerResponse = this.responseModal.locator('pre');
    this.modalAcceptButton = this.responseModal.getByRole('button', { name: 'Aceptar', exact: true });
  }

  private summaryValueContainer(label: string): Locator {
    return this.root.getByText(label, { exact: true }).locator('xpath=../following-sibling::div[1]');
  }

  /** Devuelve el valor mostrado en el resumen para la pregunta indicada. */
  async getSummaryValue(label: string): Promise<string> {
    const container = this.summaryValueContainer(label);
    const input = container.locator('input');
    if (await input.count()) {
      return (await input.inputValue()).trim();
    }
    return (await container.innerText()).trim();
  }

  async confirmInformation(): Promise<void> {
    await this.confirmInformationCheck.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async acceptModal(): Promise<void> {
    await this.modalAcceptButton.click();
  }
}
