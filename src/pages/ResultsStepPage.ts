import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Paso 4 - Resultados */
export class ResultsStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Tus resultados';
  readonly description: Locator;
  readonly realCapacityButton: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-results');
    this.description = this.root.getByText('Aquí ve su cuota y los seguros');
    this.realCapacityButton = this.root.getByRole('button', { name: '¿Quieres conocer tu capacidad real?' });
  }

  async goToRealCapacity(): Promise<void> {
    await this.realCapacityButton.click();
  }
}
