import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { FinanceData, LaborSituation, MaritalStatus } from '../data/types';

/** Paso 2 - Finanzas */
export class FinancesStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Tu situación financiera';
  readonly incomeInput: Locator;
  readonly savingsInput: Locator;
  readonly birthDateInput: Locator;
  readonly maritalStatusSelect: Locator;
  readonly maritalStatusHint: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-finances');
    this.incomeInput = this.root.getByPlaceholder('Ingresos netos');
    this.savingsInput = this.root.getByPlaceholder('Total ahorrado');
    this.birthDateInput = this.root.locator('input[type="date"]');
    this.maritalStatusSelect = this.root.locator('select');
    this.maritalStatusHint = this.root.getByText('* Casado, Soltero, Unión libre');
  }

  laborRadio(type: LaborSituation): Locator {
    return this.root.locator(`#${type}`);
  }

  async selectLaborSituation(type: LaborSituation): Promise<void> {
    await this.clickLabelFor(type);
  }

  async fillIncome(value: number): Promise<void> {
    await this.incomeInput.fill(String(value));
    await this.incomeInput.blur();
  }

  async fillSavings(value: number): Promise<void> {
    await this.savingsInput.fill(String(value));
    await this.savingsInput.blur();
  }

  async fillBirthDate(isoDate: string): Promise<void> {
    await this.birthDateInput.fill(isoDate);
  }

  async selectMaritalStatus(status: MaritalStatus): Promise<void> {
    await this.maritalStatusSelect.selectOption(status);
  }

  async fill(data: FinanceData): Promise<void> {
    await this.selectLaborSituation(data.laborSituation);
    await this.fillIncome(data.monthlyNetIncome);
    await this.fillSavings(data.savings);
    await this.fillBirthDate(data.birthDate);
    await this.selectMaritalStatus(data.maritalStatus);
  }
}
