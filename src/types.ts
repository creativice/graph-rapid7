import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The provider API client region used to authenticate requests.
   */
  clientRegion: string;

  /**
   * The provider API client secret used to authenticate requests.
   */
  clientAccessToken: string;
}

export class StatusError extends Error {
  constructor(
    readonly options: {
      statusCode: number;
      statusText: string;
      message?: string;
    },
  ) {
    super(options.message);
    this.name = 'StatusError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type Rapid7User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  timezone: string;
  status: string;
  platform_admin: boolean;
  federated: boolean;
  last_login: string;
};
