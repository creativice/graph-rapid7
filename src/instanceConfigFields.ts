import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk-core';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  clientRegion: {
    type: 'string',
  },
  clientAccessToken: {
    type: 'string',
    mask: true,
  },
};

export default instanceConfigFields;
