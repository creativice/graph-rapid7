import fetch, { Response } from 'node-fetch';
import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig, StatusError, Rapid7User } from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  private readonly clientRegion: string;
  private readonly clientAccessToken: string;

  constructor(readonly config: IntegrationConfig) {
    this.clientRegion = config.clientRegion;
    this.clientAccessToken = config.clientAccessToken;
  }

  private withBaseUri(path: string): string {
    return `https://${this.clientRegion}.api.insight.rapid7.com/${path}`;
  }

  private async request(
    uri: string,
    method: 'GET' | 'HEAD' = 'GET',
  ): Promise<Response> {
    return fetch(uri, {
      method,
      headers: {
        'X-Api-Key': this.clientAccessToken,
      },
    });
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      const response = await this.request(this.withBaseUri('validate'), 'GET');

      if (response.status !== 200) {
        throw new StatusError({
          message: 'Provider authentication failed',
          statusCode: response.status,
          statusText: response.statusText,
        });
      }
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: `https://${this.clientRegion}.api.insight.rapid7.com/validate`,
        status: err.options ? err.options.statusCode : -1,
        statusText: err.options ? err.options.statusText : '',
      });
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<Rapid7User>,
  ): Promise<void> {
    const response = await this.request(
      this.withBaseUri('account/api/1/users'),
    );
    const users: Rapid7User[] = await response.json();

    for (const user of users) {
      await iteratee(user);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
