import sendRequestAndGetResponse from './sendRequestAndGetResponse';
import { AddRoleParams, DeleteRoleParams, RoleResponseInterface } from 'interfaces/roleInterfaces';

const BASE_PATH = '/api/v2/role';

export const getRoles = (): Promise<RoleResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}`, {
    method: 'GET',
  });

export const getUserRoles = (userId: string): Promise<RoleResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/user-role/${userId}`, {
    method: 'GET',
  });

export const deleteUserRole = (options: DeleteRoleParams): Promise<RoleResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/remove/${options.userId}/${options.roleId}`, {
    method: 'DELETE',
  });

export const addUserRole = (data: AddRoleParams): Promise<RoleResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/assign-role`, {
    body: JSON.stringify(data),
    method: 'POST',
    allowBadResponses: true,
  });

export const isUserAdmin = (): Promise<RoleResponseInterface> =>
  sendRequestAndGetResponse(`${BASE_PATH}/is-user-admin-or-not`, {
    method: 'GET',
  });
