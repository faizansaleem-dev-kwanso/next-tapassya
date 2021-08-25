import { Paginate } from 'interfaces';

export interface InviteInterface {
  _id: string;
  status: string;
  teamId: string;
  organizationId: string;
  userId: string;
  roleId: string;
  email: string;
  token: string;
  type: string;
  createdAt: string;
}

export interface InviteResponseInterface {
  status: number;
  message: string;
  invitationCount: number;
  invitations?: InviteInterface[];
  paginator?: Paginate;
}

export interface InviteParams {
  email: string;
  type: string;
  organizationId: string;
  roleId: string;
}

export interface SendInviteParams {
  invitations: InviteParams[];
}

export interface GetInviteParams {
  page: number;
  limit: number;
  organizationId: string;
}

export interface ResendInviteParams extends InviteParams {
  invitationId: string;
}
