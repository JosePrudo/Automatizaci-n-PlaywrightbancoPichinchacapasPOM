import { expect, Locator, Page } from '@playwright/test';

/**
 * Página base de cada paso del wizard. Cada paso es un componente Angular
 * (app-step-*) con encabezado h2 y botones de navegación comunes.
 */
export abstract class BasePage {
  abstract readonly root: Locator;
  abstract readonly title: string;

  constructor(protected readonly page: Page) {}

  get heading(): Locator {
    return this.root.getByRole('heading', { level: 2 });
  }

  get nextButton(): Locator {
    return this.root.getByRole('button', { name: 'Siguiente', exact: true });
  }

  get backButton(): Locator {
    return this.root.getByRole('button', { name: 'Volver', exact: true });
  }

  get saveButton(): Locator {
    return this.root.getByRole('button', { name: 'Guardar formulario', exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.root).toBeVisible();
    await expect(this.heading).toHaveText(this.title);
  }

  async next(): Promise<void> {
    await this.nextButton.click();
  }

  async back(): Promise<void> {
    await this.backButton.click();
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /** Selecciona un radio/checkbox personalizado haciendo clic en su label. */
  protected async clickLabelFor(id: string): Promise<void> {
    await this.root.locator(`label[for="${id}"]`).click();
  }
}
