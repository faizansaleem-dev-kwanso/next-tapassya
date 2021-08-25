import { CONTAINER_URL_API, DOCKER_MODE, SESSION_NAME, URL_API } from '../consts';

import cookie from 'cookie';
import { getStore } from '../store';
import { makeQueryString } from './makeQueryString';
import { setCookie } from 'nookies';

export default async function sendRequestAndGetResponse(path, opts: any = {}) {
  const { externalServer, setSession, ctx } = opts;

  const headers = Object.assign(
    {},
    opts.headers || {},
    externalServer
      ? {}
      : {
          'Content-type': 'application/json; charset=UTF-8',
        },
  );
  const { request } = opts;
  if (request && request.headers && request.headers.cookie) {
    headers.cookie = request.headers.cookie;
  }

  const qs = (opts.qs && `?${makeQueryString(opts.qs)}`) || '';

  const response = await fetch(
    externalServer
      ? `${path}${qs}`
      : `${typeof window === 'undefined' && DOCKER_MODE ? CONTAINER_URL_API : URL_API}${path}${qs}`,
    Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
  );

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    const store = getStore();

    if (data.error && !opts.allowBadResponses) {
      if (response.status === 201 && data.error === 'You need to log in.' && !externalServer) {
        if (store && store.currentUser && store.currentUser.isLoggedIn && !store.isServer) {
          store.currentUser.logout();
        }
      }

      throw new Error(data.error);
    }

    if (store && store.currentUser && !store.currentUser.isLoggedIn && !store.isServer) {
      store.currentUser.login();
    }

    if (setSession) {
      const setCookieHeader = response.headers.get('Set-Cookie');
      if (setCookieHeader) {
        const cookieData = cookie.parse(setCookieHeader);
        setCookie(ctx, SESSION_NAME, cookieData[SESSION_NAME], {
          path: cookieData.Path,
          domain: cookieData.Domain,
          expires: new Date(cookieData.Expires),
        });
      }
    }

    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return text;
    }

    throw err;
  }
}
