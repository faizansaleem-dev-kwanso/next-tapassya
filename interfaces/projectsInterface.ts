import { NextRouter } from 'next/router';
import { Store } from '../lib/store';
import { InitialStateInterface, Paginate } from 'interfaces';

export interface Lti11ObjectInterface {
  _id: string;
  consumerKey: string;
  sharedSecret: string;
}

export interface Lti13ObjectInterface {
  _id: string;
  clientId: string;
  redirectUrl: string;
  tokenUrl: string;
  authorizationUrl: string;
}
interface ActionParamsObjectInterface {
  name: string;
  state: string;
  subDomain: string;
  namespace: string;
  defaultAuth: string;
  lti11?: Lti11ObjectInterface;
  lti13?: Lti13ObjectInterface;
}
export interface ActionsInterface {
  provisioned: boolean;
  inProgress: boolean;
  cancelled: boolean;
  initiator: string;
  action: string;
  params?: ActionParamsObjectInterface;
  _id: string;
  timestamp: Date;
}

export interface ProjectCardInterface {
  id: string;
  name: string;
  stage: string;
  subDomain: string;
  isCopy: boolean;
  setIsCopied: () => void;
  actions: [ActionsInterface];
}

export interface ProjectUpdateInterface {
  name: string;
  stage: string;
  subDomain: string;
  defaultAuth: string;
  organizationId: string;
  lti11?: Lti11ObjectInterface;
  lti13?: Lti13ObjectInterface;
}

export interface AuthDetailInterface {
  consumerKey?: string;
  sharedSecret?: string;
  clientId?: string;
  redirectUrl?: string;
  tokenUrl?: string;
  authorizationUrl?: string;
}

export interface NewProjectState {
  currentStep: number;
  name: string;
  selectOpen: boolean;
  subDomain: string;
  defaultAuth: string;
  authDetail: AuthDetailInterface;
  stage: string;
  teams: string[];
  disabled: boolean;
  errors: object;
  newStackId: string;
}

export interface NewProjectProps {
  router: NextRouter;
  store: Store;
  isTL: boolean;
  isMobile: boolean;
  initialState: InitialStateInterface;
}

export interface ProjectInterface {
  _id: string;
  deleted: boolean;
  teamId: string;
  name: string;
  subDomain: string;
  stage: string;
  defaultAuth: string;
  namespace: string;
  createdAt: string;
  lti11?: Lti11ObjectInterface;
  lti13?: Lti13ObjectInterface;
  actions: [ActionsInterface];
  organizationId: string;
  teams?: string[];
}

export interface ProjectResponseInterface {
  status: number;
  message: string;
  projectCount?: number;
  projects?: ProjectInterface[];
  project?: ProjectInterface;
  paginator?: Paginate;
}

export interface GetProjectParams {
  page: number;
  limit: number;
  organizationId?: string;
  search?: string;
  teamId?: string;
}

export interface AddProjectBody {
  teams: string[];
  organizationId: string;
  name: string;
  stage: string;
  subDomain: string;
  namespace: string;
  userId: string;
  defaultAuth: string;
  authDetail?: AuthDetailInterface;
}

export interface UpdateProjectParams {
  stackId: string | string[];
  data: ProjectUpdateInterface;
}
