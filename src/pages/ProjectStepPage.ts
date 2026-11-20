import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ApplicationType, City, HousingType, ProjectData } from '../data/types';

/** Paso 1 - Proyecto */
export class ProjectStepPage extends BasePage {
  readonly root: Locator;
  readonly title = 'Tu proyecto de vivienda';
  readonly citySelect: Locator;
  readonly priceMinSlider: Locator;
  readonly priceMaxSlider: Locator;
  readonly priceRangeLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.root = page.locator('app-step-project');
    this.citySelect = this.root.locator('select');
    this.priceMinSlider = this.root.locator('input[type="range"]').nth(0);
    this.priceMaxSlider = this.root.locator('input[type="range"]').nth(1);
    this.priceRangeLabel = this.root.getByText('(valor estimado)').locator('xpath=preceding-sibling::span');
  }

  applicationRadio(type: ApplicationType): Locator {
    return this.root.locator(`#${type}`);
  }

  housingRadio(type: HousingType): Locator {
    return this.root.locator(`#${type}`);
  }

  async selectApplicationType(type: ApplicationType): Promise<void> {
    await this.clickLabelFor(type);
  }

  async selectHousingType(type: HousingType): Promise<void> {
    await this.clickLabelFor(type);
  }

  async selectCity(city: City): Promise<void> {
    await this.citySelect.selectOption(city);
  }

  async setPriceRange(min: number, max: number): Promise<void> {
    await this.priceMinSlider.fill(String(min));
    await this.priceMaxSlider.fill(String(max));
  }

  async fill(data: ProjectData): Promise<void> {
    await this.selectApplicationType(data.applicationType);
    await this.selectHousingType(data.housingType);
    await this.selectCity(data.city);
    if (data.priceMin !== undefined && data.priceMax !== undefined) {
      await this.setPriceRange(data.priceMin, data.priceMax);
    }
  }
}
