import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ContactData, ContactMethod, PreferredTime } from '../data/types';

/** Paso 6 - Contacto */
export class ContactStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Quiero que me Contacten';
  readonly privacyPolicyCheck: Locator;
  readonly productInfoCheck: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-contact');
    this.privacyPolicyCheck = this.root.locator('#acceptsPrivacyPolicy');
    this.productInfoCheck = this.root.locator('#wantsProductInfo');
  }

  preferredTimeRadio(time: PreferredTime): Locator {
    return this.root.locator(`input[name="preferredTime"][value="${time}"]`);
  }

  contactMethodRadio(method: ContactMethod): Locator {
    return this.root.locator(`input[name="contactMethod"][value="${method}"]`);
  }

  async fill(data: ContactData): Promise<void> {
    await this.preferredTimeRadio(data.preferredTime).check();
    await this.contactMethodRadio(data.contactMethod).check();
    await this.privacyPolicyCheck.setChecked(data.acceptsPrivacyPolicy);
    await this.productInfoCheck.setChecked(data.wantsProductInfo);
  }
}
