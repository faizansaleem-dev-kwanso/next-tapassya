// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import { getUser } from './api/public';
import { getOrganization, getStripePlans } from './api/organization';
import { getTeam } from './api/team-leader';
import { isMobile } from './isMobile';
import { COMMON_ENTITY, URL_API } from './consts';
import Pluralize from 'pluralize';
import { InitialStateInterface } from 'interfaces';

const redirectTo = (res, location, data) => {
  if (res) {
    res.writeHead(302, {
      Location: location,
    });
    res.end();
    return [data, true];
  }
};

/**
 * Validates req and fetch data
 * @param req
 * @param res
 * @param query
 * @param [currentUrl]
 * @param { logoutRequired, onVerificationPage, nameNotSetPath, notLoggedInPath, dontRedirect }
 * @returns
 */
export async function validateReqAndFetchData(
  req: Request,
  res: Response,
  query,
  currentUrl = null,
  { logoutRequired, onVerificationPage, nameNotSetPath, notLoggedInPath, dontRedirect },
) {
  let user = null;
  const initialState: Partial<InitialStateInterface> = {
    currentUrl: currentUrl,
    user: user,
  };
  let organizations = null;
  const data = {
    props: {
      initialState: initialState,
      isMobile: isMobile({ req }),
    },
  };

  try {
    user = ((await getUser(req)) || {}).user;
  } catch (error) {}

  if (user) {
    data.props.initialState.user = user;
    data.props.initialState.organizationSlug = query.organizationSlug || user.defaultTeamSlug;
    const response = await getStripePlans({ request: req });
    if (response.status === 200) {
      data.props.initialState.plans = response.plans;
    } else {
      data.props.initialState.plans = null;
    }
    if (query.teamSlug) {
      const selectedTeam = await getTeam({ teamSlug: query.teamSlug, request: req });
      if (!selectedTeam.team) {
        return redirectTo(res, '/not-found', data);
      } else {
        data.props.initialState.selectedTeam = selectedTeam;
      }
    }

    try {
      organizations = await getOrganization({ request: req });
      data.props.initialState.organizations = organizations.organizations;
    } catch (error) {}

    if (!user.emailVerified && !onVerificationPage) {
      return redirectTo(res, '/email-verification', data);
    } else if (user.emailVerified && onVerificationPage) {
      return redirectTo(res, '/login', data);
    }

    if (query.organizationSlug) {
      const selectedOrganization =
        organizations.organizations &&
        organizations.organizations.find(
          (organization) => organization.slug === query.organizationSlug,
        );
      if (selectedOrganization) {
        data.props.initialState.selectedSlug = selectedOrganization.slug;
      }
    }

    if (!user.firstName && nameNotSetPath && !dontRedirect) {
      return redirectTo(res, nameNotSetPath, data);
    }
    if (!organizations && !dontRedirect) {
      return redirectTo(res, nameNotSetPath, data);
    }
  } else if (notLoggedInPath) {
    return redirectTo(res, notLoggedInPath, data);
  } else if (logoutRequired) {
    return redirectTo(res, `${URL_API}/api/v1/auth0/login`, {});
  } else {
    return [data, false];
  }

  if ((logoutRequired || !dontRedirect) && user) {
    const { organizations = [] } = await getOrganization({ request: req });

    const selectedOrganization =
      organizations && organizations.find((organization) => organization.ownerId === user._id);

    if (!selectedOrganization) {
      if (!dontRedirect) {
        return redirectTo(res, nameNotSetPath, data);
      } else {
        return [data, false];
      }
    }

    if (logoutRequired) {
      if (selectedOrganization) {
        if (selectedOrganization.billingId.isCard) {
          return redirectTo(res, `/${selectedOrganization.slug}/${Pluralize(COMMON_ENTITY)}`, data);
        } else {
          return redirectTo(res, '/plans', data);
        }
      } else {
        return redirectTo(res, '/profile-settings', data);
      }
    }
  }

  return [data, false];
}
/**
 * Withs auth
 * @param handler
 * @param {
 *     nameNotSetPath = '/plans',
 *     notLoggedInPath = '/login',
 *     logoutRequired = false,
 *     dontRedirect = false,
 *     onVerificationPage = false,
 *   }
 * @returns
 */

export function withAuth(
  handler,
  {
    nameNotSetPath = '/user-info',
    notLoggedInPath = '/login',
    logoutRequired = false,
    dontRedirect = false,
    onVerificationPage = false,
  },
) {
  return async function sessionHandler(...args) {
    const handlerType = args[0] && args[1] ? 'api' : 'ssr';
    const req = handlerType === 'api' ? args[0] : args[0].req;
    const res = handlerType === 'api' ? args[1] : args[0].res;
    const query = handlerType === 'api' ? {} : args[0].query;
    const currentUrl = handlerType === 'api' ? {} : args[0].asPath;

    const [data, redirected] = await validateReqAndFetchData(req, res, query, currentUrl, {
      logoutRequired,
      nameNotSetPath,
      notLoggedInPath,
      dontRedirect,
      onVerificationPage,
    });

    if (redirected || !handler) {
      return data;
    }

    return Object.assign(data, await handler(data, ...args));
  };
}
