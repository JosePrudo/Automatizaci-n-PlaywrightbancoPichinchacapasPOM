import { expect, Locator, Page } from '@playwright/test';
import { STEP_NAMES } from '../data/simulationData';

/** Contenedor del simulador: cabecera, título principal y stepper de 7 pasos. */
export class WizardPage {
  readonly mainTitle: Locator;
  readonly logo: Locator;
  readonly stepper: Locator;

  constructor(private readonly page: Page) {
    this.mainTitle = page.getByRole('heading', { level: 1, name: 'Tu Credito de Vivienda' });
    this.logo = page.locator('app-header').getByRole('img', { name: /Banco Pichincha Logo/ });
    this.stepper = page.locator('app-wizard-stepper');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.mainTitle).toBeVisible();
  }

  stepLabel(name: (typeof STEP_NAMES)[number]): Locator {
    return this.stepper.getByText(name, { exact: true });
  }

  async goToStepFromStepper(name: (typeof STEP_NAMES)[number]): Promise<void> {
    await this.stepLabel(name).click();
  }
}
