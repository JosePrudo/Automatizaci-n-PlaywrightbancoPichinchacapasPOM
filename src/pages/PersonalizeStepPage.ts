import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { LoanTerm, PaymentType, PersonalizeData } from '../data/types';

/** Paso 3 - Personaliza */
export class PersonalizeStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Personaliza tu crédito de vivienda';
  readonly loanAmountInput: Locator;
  readonly loanAmountHint: Locator;
  readonly loanTermSelect: Locator;
  readonly loanTermHint: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-personalize');
    this.loanAmountInput = this.root.getByPlaceholder('Monto total del préstamo');
    this.loanAmountHint = this.root.getByText('Se calcula automáticamente pero puede modificar');
    this.loanTermSelect = this.root.locator('select');
    this.loanTermHint = this.root.getByText('5, 10, 15, 20, 25 ó 30 años');
  }

  paymentRadio(type: PaymentType): Locator {
    return this.root.locator(`#${type}`);
  }

  /** El monto se valida al perder el foco (blur). */
  async fillLoanAmount(value: number): Promise<void> {
    await this.loanAmountInput.fill(String(value));
    await this.loanAmountInput.blur();
  }

  async selectLoanTerm(years: LoanTerm): Promise<void> {
    await this.loanTermSelect.selectOption(years);
  }

  async selectPaymentType(type: PaymentType): Promise<void> {
    await this.clickLabelFor(type);
  }

  async fill(data: PersonalizeData): Promise<void> {
    await this.fillLoanAmount(data.loanAmount);
    await this.selectLoanTerm(data.loanTermYears);
    await this.selectPaymentType(data.paymentType);
  }
}
