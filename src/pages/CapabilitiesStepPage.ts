import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CapabilitiesData } from '../data/types';

/** Paso 5 - Capacidades */
export class CapabilitiesStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Tu capacidad real';
  readonly fullNameInput: Locator;
  readonly cedulaInput: Locator;
  readonly emailInput: Locator;
  readonly emailHint: Locator;
  readonly phoneInput: Locator;
  readonly authorizeCreditCheck: Locator;
  readonly dependentsInput: Locator;
  readonly workplaceInput: Locator;
  readonly workplaceHint: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-capabilities');
    this.fullNameInput = this.root.getByPlaceholder('Nombre completo');
    this.cedulaInput = this.root.getByPlaceholder('Documento de identidad');
    this.emailInput = this.root.getByPlaceholder('Correo electrónico @');
    this.emailHint = this.root.getByText('Recuerda usar el @ y la extensión de tu correo electrónico (.com)');
    this.phoneInput = this.root.getByPlaceholder('+57 (000) 000 00 00');
    this.authorizeCreditCheck = this.root.locator('#authorizeCreditCheck');
    this.dependentsInput = this.root.getByPlaceholder('Cargas familiares');
    this.workplaceInput = this.root.getByPlaceholder('Compañía de tecnología S.A.S');
    this.workplaceHint = this.root.getByText('Para verificar si tiene convenio corporativo.');
  }

  async fill(data: CapabilitiesData): Promise<void> {
    await this.fullNameInput.fill(data.fullName);
    await this.cedulaInput.fill(data.cedula);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.authorizeCreditCheck.setChecked(data.authorizeCreditCheck);
    await this.dependentsInput.fill(String(data.dependents));
    await this.workplaceInput.fill(data.workplace);
  }
}
