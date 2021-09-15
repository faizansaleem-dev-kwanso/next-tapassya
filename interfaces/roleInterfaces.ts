export interface RoleInterface {
  _id: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleResponseInterface {
  status: number;
  message: string;
  isAdmin?: boolean;
  isOrganization?: boolean;
  isMember?: boolean;
  roles?: RoleInterface[];
}

export interface AddRoleParams {
  roleId: string;
  userId: string;
}

export type DeleteRoleParams = AddRoleParams;
