import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import {
  TeamResponse,
  GetTeamResponse,
  TeamParamsInterface,
  AddTeamParams,
  UpdateTeamParams,
  GetTeamParams,
} from 'interfaces/teamInterfaces';
import { DeactivateUserInterface } from 'interfaces/userInterfaces';

const BASE_PATH = '/api/v2/team-leader';

export const deactivateAccount = (): Promise<DeactivateUserInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/deactivate-account`, {
    method: 'GET',
  });

export const addTeam = (data: AddTeamParams): Promise<TeamResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/add`, {
    body: JSON.stringify(data),
  });

export const removeTeam = (id: string): Promise<TeamResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/remove-team/${id}`, {
    method: 'DELETE',
  });

export const getTeam = (options: GetTeamParams): Promise<TeamResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/${options.teamSlug}`, {
    method: 'GET',
    ...options,
  });

export const searchTeams = (options: TeamParamsInterface): Promise<TeamResponse> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/teams/search-teams/${options.organizationId}?search=${encodeURIComponent(
      options.search,
    )}&page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );

export const getTeamList = (options: TeamParamsInterface): Promise<GetTeamResponse> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/teams/list-by-organization/${options.organizationId}?page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
    },
  );

export const getAllTeams = (organizationId: string): Promise<GetTeamResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/list-all-teams/${organizationId}`, {
    method: 'GET',
  });

export const updateTeam = (data: UpdateTeamParams): Promise<TeamResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/teams/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const fetchCheckoutSession = ({
  mode,
  billingId,
  planId,
  planName,
  returnUrl,
}: {
  mode: string;
  billingId: string;
  planId: string;
  planName: string;
  returnUrl: string;
}) =>
  sendRequestAndGetResponse(`${BASE_PATH}/stripe/fetch-checkout-session`, {
    body: JSON.stringify({ mode, billingId, returnUrl, planId, planName }),
  });

export const cancelSubscriptionApiMethod = ({ billingId }: { billingId: string }) =>
  sendRequestAndGetResponse(`${BASE_PATH}/cancel-subscription`, {
    body: JSON.stringify({ billingId }),
  });

export const createStripePortalSession = (billingId, returnUrl, updatePlan) =>
  sendRequestAndGetResponse(`${BASE_PATH}/stripe/customer-portal-session`, {
    body: JSON.stringify({ billingId, returnUrl, updatePlan }),
  });
