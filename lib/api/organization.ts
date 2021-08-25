import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import {
  AddOrgParams,
  OrganizationCardDetailsResponse,
  OrganizationResponse,
  UpdateOrgParams,
} from 'interfaces/organizationInterfaces';

const BASE_PATH = '/api/v2/organization';

export const createOrganization = (data: AddOrgParams): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/add`, {
    body: JSON.stringify(data),
  });

export const isOrgTransfered = (organizationId: string): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/is-organization-transfered/${organizationId}`, {
    method: 'GET',
  });

export const acceptTransferOrg = (token: string): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/accept-transfered-organization`, {
    body: JSON.stringify({ token: token }),
  });

export const getStripePlans = (options: { request: Request }): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/stripe-plans`, {
    method: 'GET',
    ...options,
  });

export const deleteOrganization = (organizationId: string): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/delete/${organizationId}`, {
    method: 'DELETE',
  });

export const updateOrganization = (data: UpdateOrgParams): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/update`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getOrganization = (options: { request: Request }): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/list-by-owner`, {
    method: 'GET',
    ...options,
  });

export const getOrganizationCardDetails = (): Promise<OrganizationCardDetailsResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/card-detail`, {
    method: 'GET',
  });

export const getOrganizationDefaultTeam = (organizationId: string): Promise<OrganizationResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/get-organization-default-team/${organizationId}`, {
    method: 'GET',
  });
