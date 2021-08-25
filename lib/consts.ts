// Import this module on any other module like so:
// import { IS_DEV } from './consts';

export const NODE_ENV = process.env.NODE_ENV || 'development';

export const IS_DEV = NODE_ENV !== 'production';

export const PORT_APP = process.env.PORT || 3000;

export const PORT_API = process.env.PORT_API || 8000;

export const COMMON_ENTITY = 'campus';

let urlAPI: string = process.env.URL_API;
if (!urlAPI) {
  urlAPI = IS_DEV
    ? process.env.DEVELOPMENT_URL_API || `http://localhost:${PORT_API}`
    : process.env.PRODUCTION_URL_API;
}
export const URL_API = urlAPI;
export const CONTAINER_URL_API = process.env.CONTAINER_URL_API || URL_API;
export const DOCKER_MODE = process.env.DOCKER_MODE === '1';

let urlAPP: string = process.env.URL_APP;
if (!urlAPP) {
  urlAPP = IS_DEV
    ? process.env.DEVELOPMENT_URL_APP || `http://localhost:${PORT_APP}`
    : process.env.PRODUCTION_URL_APP;
}
export const URL_APP = urlAPP;

export const STRIPEPUBLISHABLEKEY: string =
  process.env.STRIPEPUBLISHABLEKEY || process.env.StripePublishableKey;
export const BUCKET_FOR_TEAM_AVATARS: string = process.env.BUCKET_FOR_TEAM_AVATARS;

export const SESSION_NAME = process.env.SESSION_NAME;

export const PAGE_SIZE: number = +process.env.PAGE_SIZE || 6;

export const CANNY_BOARD_TOKEN = process.env.CANNY_BOARD_TOKEN;
export const CANNY_APP_ID = process.env.CANNY_APP_ID;

export const ZENDESK_CHAT_ACCOUNT_KEY = process.env.ZENDESK_CHAT_ACCOUNT_KEY;

export const OIDC_AUTH_NAME = process.env.OIDC_AUTH_NAME || 'Simple Auth';

export const FormRules = {
  email: {
    required: true,
    message: 'Please input email',
  },
  teamName: {
    required: true,
    message: 'Please input team name',
  },
  aboutTeam: {
    required: true,
    message: 'Please input team details',
  },
  organizationName: {
    required: true,
    message: 'Please input organization name',
  },
  role: {
    required: true,
    message: 'Please choose role',
  },
};
