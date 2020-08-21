import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../types';
import { fetchUsers } from './access';
import { fetchAccountDetails } from './account';

const DEFAULT_CLIENT_REGION = 'eu';
const DEFAULT_CLIENT_ACCESS_TOKEN = 'eu';

const integrationConfig: IntegrationConfig = {
  clientRegion: process.env.CLIENT_REGION || DEFAULT_CLIENT_REGION,
  clientAccessToken:
    process.env.CLIENT_ACCESS_TOKEN || DEFAULT_CLIENT_ACCESS_TOKEN,
};

test('should collect data', async () => {
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: integrationConfig,
  });

  // Simulates dependency graph execution.
  // See https://github.com/JupiterOne/sdk/issues/262.
  await fetchAccountDetails(context);
  await fetchUsers(context);

  // Review snapshot, failure is a regression
  expect({
    numCollectedEntities: context.jobState.collectedEntities.length,
    numCollectedRelationships: context.jobState.collectedRelationships.length,
    collectedEntities: context.jobState.collectedEntities,
    collectedRelationships: context.jobState.collectedRelationships,
    encounteredTypes: context.jobState.encounteredTypes,
  }).toMatchSnapshot();

  expect(
    context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Account'),
    ),
  ).toMatchGraphObjectSchema({
    _class: ['Account'],
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'rapid7_account' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  });

  expect(
    context.jobState.collectedEntities.filter((e) => e._class.includes('User')),
  ).toMatchGraphObjectSchema({
    _class: ['User'],
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'rapid7_user' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
    },
  });
});
