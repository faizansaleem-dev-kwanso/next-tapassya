import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import {
  GetInviteParams,
  InviteParams,
  InviteResponseInterface,
  ResendInviteParams,
  SendInviteParams,
} from 'interfaces/inviteInterfaces';
const BASE_PATH = '/api/v2/invitation';

export const sendInvite = (data: SendInviteParams): Promise<InviteResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/send-invite`, {
    body: JSON.stringify(data),
    method: 'POST',
    allowBadResponses: true,
  });

export const transferInvite = (
  data: Pick<InviteParams, 'email' | 'organizationId' | 'type'>,
): Promise<InviteResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/transfer-organization`, {
    body: JSON.stringify(data),
    method: 'POST',
    allowBadResponses: true,
  });

export const getInvites = (options: GetInviteParams): Promise<InviteResponseInterface> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/list-pending-invitation/${options.organizationId}?page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );

export const deleteInvites = (inviteId: string): Promise<InviteResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/remove-invitation/${inviteId}`, {
    method: 'DELETE',
  });

export const resendInvites = (data: ResendInviteParams): Promise<InviteResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/resend-invite`, {
    body: JSON.stringify(data),
    method: 'POST',
  });
