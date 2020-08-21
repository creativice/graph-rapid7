import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';

export const ACCOUNT_ENTITY_KEY = 'entity:account';
export const ACCOUNT_ENTITY_TYPE = 'rapid7_account';

export async function fetchAccountDetails({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntity = createIntegrationEntity({
    entityData: {
      source: {
        id: 'acme-unique-account-id',
        name: 'Example Co. Acme Account',
      },
      assign: {
        _key: 'acme-unique-account-id',
        _type: ACCOUNT_ENTITY_TYPE,
        _class: 'Account',
        mfaEnabled: true,
      },
    },
  });

  await Promise.all([
    jobState.addEntity(accountEntity),
    jobState.setData(ACCOUNT_ENTITY_KEY, accountEntity),
  ]);
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    types: [ACCOUNT_ENTITY_TYPE],
    dependsOn: [],
    executionHandler: fetchAccountDetails,
  },
];
