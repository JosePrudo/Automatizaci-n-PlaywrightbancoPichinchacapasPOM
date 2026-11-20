import { test as base } from '@playwright/test';
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
import { SimulationFlow, SimulationPages } from '../flows/SimulationFlow';

type Fixtures = SimulationPages & { flow: SimulationFlow };

export const test = base.extend<Fixtures>({
  wizard: async ({ page }, use) => use(new WizardPage(page)),
  projectStep: async ({ page }, use) => use(new ProjectStepPage(page)),
  financesStep: async ({ page }, use) => use(new FinancesStepPage(page)),
  personalizeStep: async ({ page }, use) => use(new PersonalizeStepPage(page)),
  resultsStep: async ({ page }, use) => use(new ResultsStepPage(page)),
  capabilitiesStep: async ({ page }, use) => use(new CapabilitiesStepPage(page)),
  contactStep: async ({ page }, use) => use(new ContactStepPage(page)),
  confirmationStep: async ({ page }, use) => use(new ConfirmationStepPage(page)),
  flow: async (
    { wizard, projectStep, financesStep, personalizeStep, resultsStep, capabilitiesStep, contactStep, confirmationStep },
    use,
  ) =>
    use(
      new SimulationFlow({
        wizard,
        projectStep,
        financesStep,
        personalizeStep,
        resultsStep,
        capabilitiesStep,
        contactStep,
        confirmationStep,
      }),
    ),
});

export { expect } from '@playwright/test';
