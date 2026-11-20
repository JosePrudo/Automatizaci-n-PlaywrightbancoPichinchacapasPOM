import { test } from '@playwright/test';
import {
  CapabilitiesStepPage,
  ConfirmationStepPage,
  ContactStepPage,
  FinancesStepPage,
  PersonalizeStepPage,
  ProjectStepPage,
  ResultsStepPage,
  WizardPage,
} from '../pages';
import { SimulationData } from '../data/types';

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SimulationPages {
  wizard: WizardPage;
  projectStep: ProjectStepPage;
  financesStep: FinancesStepPage;
  personalizeStep: PersonalizeStepPage;
  resultsStep: ResultsStepPage;
  capabilitiesStep: CapabilitiesStepPage;
  contactStep: ContactStepPage;
  confirmationStep: ConfirmationStepPage;
}

/**
 * Capa de negocio: orquesta los Page Objects para recorrer el wizard
 * hasta el paso deseado con un set de datos.
 */
export class SimulationFlow {
  constructor(private readonly p: SimulationPages) {}

  async completeProject(data: SimulationData): Promise<void> {
    await test.step('Paso 1 - Proyecto: completar y continuar', async () => {
      await this.p.projectStep.expectLoaded();
      await this.p.projectStep.fill(data.project);
      await this.p.projectStep.next();
    });
  }

  async completeFinances(data: SimulationData): Promise<void> {
    await test.step('Paso 2 - Finanzas: completar y continuar', async () => {
      await this.p.financesStep.expectLoaded();
      await this.p.financesStep.fill(data.finance);
      await this.p.financesStep.next();
    });
  }

  async completePersonalize(data: SimulationData): Promise<void> {
    await test.step('Paso 3 - Personaliza: completar y continuar', async () => {
      await this.p.personalizeStep.expectLoaded();
      await this.p.personalizeStep.fill(data.personalize);
      await this.p.personalizeStep.next();
    });
  }

  async continueResults(): Promise<void> {
    await test.step('Paso 4 - Resultados: continuar', async () => {
      await this.p.resultsStep.expectLoaded();
      await this.p.resultsStep.next();
    });
  }

  async completeCapabilities(data: SimulationData): Promise<void> {
    await test.step('Paso 5 - Capacidades: completar y continuar', async () => {
      await this.p.capabilitiesStep.expectLoaded();
      await this.p.capabilitiesStep.fill(data.capabilities);
      await this.p.capabilitiesStep.next();
    });
  }

  async completeContact(data: SimulationData): Promise<void> {
    await test.step('Paso 6 - Contacto: completar y continuar', async () => {
      await this.p.contactStep.expectLoaded();
      await this.p.contactStep.fill(data.contact);
      await this.p.contactStep.next();
    });
  }

  /** Abre el simulador y avanza hasta dejar visible el paso `target`. */
  async goToStep(target: StepNumber, data: SimulationData): Promise<void> {
    await this.p.wizard.open();
    const steps: Array<() => Promise<void>> = [
      () => this.completeProject(data),
      () => this.completeFinances(data),
      () => this.completePersonalize(data),
      () => this.continueResults(),
      () => this.completeCapabilities(data),
      () => this.completeContact(data),
    ];
    for (let i = 0; i < target - 1; i++) {
      await steps[i]();
    }
  }
}
