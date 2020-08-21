import {
  createDirectRelationship,
  createIntegrationEntity,
  Entity,
  generateRelationshipType,
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../client';
import { IntegrationConfig } from '../types';
import { ACCOUNT_ENTITY_KEY, ACCOUNT_ENTITY_TYPE } from './account';

const USER_ENTITY_TYPE = 'rapid7_user';

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const accountEntity = (await jobState.getData(ACCOUNT_ENTITY_KEY)) as Entity;

  await apiClient.iterateUsers(async (user) => {
    const userEntity = createIntegrationEntity({
      entityData: {
        source: user,
        assign: {
          _type: USER_ENTITY_TYPE,
          _class: 'User',
          name: `${user.first_name} ${user.last_name}`,
          username: user.email,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      },
    });

    await Promise.all([
      jobState.addEntity(userEntity),
      jobState.addRelationship(
        createDirectRelationship({
          _class: 'HAS',
          from: accountEntity,
          to: userEntity,
        }),
      ),
    ]);
  });
}

export const accessSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    types: [
      USER_ENTITY_TYPE,
      generateRelationshipType('HAS', ACCOUNT_ENTITY_TYPE, USER_ENTITY_TYPE),
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchUsers,
  },
];
