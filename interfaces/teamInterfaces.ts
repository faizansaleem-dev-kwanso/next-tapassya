import { Paginate } from 'interfaces';
import { UserInterface } from './userInterfaces';

export interface Members {
  _id: string;
  userId: string;
  role: string;
}

export interface TeamInterface {
  _id: string;
  defaultTeam?: boolean;
  teamLeaderId: string;
  organizationId?: string;
  isPaidSubscriptionActive?: string;
  isTrialProvisionedOnce?: string;
  stripeSubscriptionId?: string;
  isPaymentFailed?: string;
  stripeCustomerId?: string;
  members?: Array<Members>;
  description: string;
  name: string;
  slug: string;
  avatarUrl: string;
  createdAt: string;
}

export interface TeamMemberParamsInterface {
  teamId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface MappedTeamMemberInterface {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  checked: boolean;
}

export interface TeamMemberTagInterface {
  email: string;
  name: string;
  id: string;
  avatarUrl: string;
}

export interface MembersToAddInterface {
  userId: string;
  teamId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
}

export interface TeamMemberInterface {
  _id: string;
  userId: UserInterface;
  teamId: TeamInterface;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberResponse {
  status: number;
  message: string;
  teamCount?: number;
  teamMember?: TeamMemberInterface;
  teamMembers?: Array<TeamMemberInterface>;
  teams?: Array<TeamMemberInterface>;
  paginator?: Paginate;
}

export interface TeamResponse {
  status: number;
  message: string;
  team?: TeamInterface;
  teams?: TeamInterface[];
  paginator?: Paginate;
}

export interface GetTeamResponse {
  status: number;
  message: number;
  teams: TeamInterface[];
  paginator: Paginate;
}

export interface RoleTableInterface {
  user: {
    email: string;
    name: string;
    avatarUrl: string;
  };
  key: string;
  role: string;
}

export interface TeamParamsInterface {
  organizationId: string;
  page: number;
  limit: number;
  search?: string;
}

export interface AddTeamParams {
  name: string;
  description: string;
  organizationId: string;
}

export interface UpdateTeamParams {
  teamId: string;
  avatarUrl: string;
  name: string;
  description: string;
}

export interface GetTeamParams {
  teamSlug: string | string[];
  request: Request;
}

export interface AddMemberParams {
  members: MembersToAddInterface[];
}

export interface GetMemberOrTeamParams {
  teamId?: string;
  userId?: string;
  limit: number;
  page: number;
}
