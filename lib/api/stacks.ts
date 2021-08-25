import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import {
  AddProjectBody,
  GetProjectParams,
  ProjectResponseInterface,
  UpdateProjectParams,
} from 'interfaces/projectsInterface';

const BASE_PATH = '/api/v2/project';

export const getStacks = (options: GetProjectParams): Promise<ProjectResponseInterface> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/list-by-organization/${options.organizationId}?page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );

export const validateStack = (data) =>
  sendRequestAndGetResponse(`${BASE_PATH}/validate`, {
    body: JSON.stringify(data),
    allowBadResponses: true,
  });

export const searchStack = (params: GetProjectParams): Promise<ProjectResponseInterface> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/search-projects/${params.organizationId}?search=${params.search}&page=${params.page}&limit=${params.limit}`,
    {
      method: 'GET',
    },
  );

export const createStack = (data: AddProjectBody): Promise<ProjectResponseInterface> =>
  sendRequestAndGetResponse(BASE_PATH, {
    body: JSON.stringify(data),
    allowBadResponses: true,
  });

export const getStack = (stackId: string | string[]): Promise<ProjectResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/${stackId}`, {
    method: 'GET',
  });

export const updateStack = (params: UpdateProjectParams): Promise<ProjectResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/${params.stackId}`, {
    body: JSON.stringify(params.data),
    method: 'PUT',
    allowBadResponses: true,
  });

export const deleteStack = (stackId) =>
  sendRequestAndGetResponse(`${BASE_PATH}/${stackId}`, {
    method: 'DELETE',
  });

export const actionOnStack = (stackId, action) =>
  sendRequestAndGetResponse(`${BASE_PATH}/${stackId}/action/${action}`, {
    body: '{}',
    allowBadResponses: true,
  });

export const getTeamProjects = (options: GetProjectParams): Promise<ProjectResponseInterface> =>
  sendRequestAndGetResponse(
    `${BASE_PATH}/list-by-team/${options.teamId}?page=${options.page}&limit=${options.limit}`,
    {
      method: 'GET',
      ...options,
    },
  );
