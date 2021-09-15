import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import {
  TeamMemberResponse,
  TeamMemberParamsInterface,
  AddMemberParams,
  GetMemberOrTeamParams,
} from 'interfaces/teamInterfaces';
import { UpdateUserParams, UserResponseInterface } from 'interfaces/userInterfaces';

const BASE_PATH = '/api/v2/team-member';

export const updateProfile = (data: UpdateUserParams): Promise<UserResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/update-profile`, {
    body: JSON.stringify(data),
  });

export const addMember = (data: AddMemberParams): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/add`, {
    body: JSON.stringify(data),
  });

export const searchTeamMember = (options: TeamMemberParamsInterface): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/search-team-members/${options.teamId}?search=${encodeURIComponent(
      options.search,
    )}&page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );

export const getTeamMemberTeams = (options: GetMemberOrTeamParams): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/teams/${options.userId}?page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );

export const getMemberList = (options: GetMemberOrTeamParams): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/list-by-team/${options.teamId}?page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );

export const getTeamMember = (memberId: string | string[]): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/${memberId}`, {
    method: 'GET',
  });

export const removeTeamMember = (memberId: string | string[]): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/${memberId}`, {
    method: 'DELETE',
  });

export const removeTeamMemberFromOrganization = (
  userId: string,
  organizationId: string,
): Promise<TeamMemberResponse> =>
  sendRequestAndGetResponse(`${BASE_PATH}/remove-from-org/${userId}/${organizationId}`, {
    method: 'DELETE',
  });

// Uploading file to S3

export const getSignedRequestForUpload = ({ file, prefix, bucket, acl = 'public-read' }) =>
  sendRequestAndGetResponse(`${BASE_PATH}/aws/get-signed-request-for-upload-to-s3`, {
    body: JSON.stringify({ fileName: file.name, fileType: file.type, prefix, bucket, acl }),
  });

export const uploadFileUsingSignedPutRequest = (file, signedRequest, headers = {}) =>
  sendRequestAndGetResponse(signedRequest, {
    externalServer: true,
    method: 'PUT',
    body: file,
    headers,
  });

export const toggleTheme = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/user/toggle-theme`, {
    body: JSON.stringify(data),
  });

export const getSubscriptionId = (options: any = {}) =>
  sendRequestAndGetResponse(`${BASE_PATH}/${options.data.id}/subscription-id`, {
    ...options,
    method: 'GET',
  });
