import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import { InviteResponseInterface } from 'interfaces/inviteInterfaces';

const BASE_PATH = '/api/v2/public';

export const getUser = (request: Request) =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/get-user`,
    Object.assign(
      {
        method: 'GET',
      },
      request,
    ),
  );

export const checkInvitationVerification = (data: {
  token: string;
}): Promise<InviteResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/check-invitation-verification`, {
    body: JSON.stringify(data),
    method: 'POST',
    allowBadResponses: true,
  });

export const checkEmailVerification = () =>
  sendRequestAndGetResponse(`${BASE_PATH}/check-email-verification`, {
    method: 'GET',
  });
