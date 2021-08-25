import { NextRouter } from 'next/router';
import { Store } from '../lib/store';
import React from 'react';
import { Team } from '../lib/store';
import { Stacks } from 'lib/store/stacks';
import { Organization } from 'lib/store/organization';
import { CardInterface, OrganizationInterface, PlansEntity } from './organizationInterfaces';
import { RoleTableInterface, TeamMemberInterface, TeamResponse } from './teamInterfaces';
import { UserInterface } from './userInterfaces';

export interface StackStateInterface {
  loading: boolean;
  stacks: [];
  search: string;
  totalPage: number;
  current: number;
  minIndex: number;
  maxIndex: number;
}

export interface InitialStateInterface {
  currentUrl: string | null;
  user: UserInterface;
  organizationSlug: string;
  organizations: OrganizationInterface[];
  selectedSlug: string;
  plans: PlansEntity[];
  selectedTeam: TeamResponse;
}

export interface StackModalInterface {
  title: string;
  subTitle: string;
  buttonText: string;
  isShowModal: boolean;
  name?: string;
  close: () => void;
  action?: (mode?: 'setup' | 'subscription') => void;
}

export interface ToastMessageInterface {
  title: string;
  className: string;
}

export interface TabInterface {
  text: string;
  default: string;
  onClick: () => void;
}

export interface TeamMemberCardProps {
  store?: Store;
  user: TeamMemberInterface;
  defaultTeam: boolean;
  initialState: InitialStateInterface;
  key: number;
  team?: string;
}

export interface TeamCardProps {
  title: string;
  store?: Store;
  slug?: string;
  defaultTeam?: boolean;
  teamId?: string;
  content: string;
  initialState: InitialStateInterface;
  memberDetailView?: boolean;
  memberView?: boolean;
}

export interface TeamPageProps {
  router: NextRouter;
  store: Store;
  teamStore: Team;
  isTL: boolean;
  isMobile: boolean;
  initialState: InitialStateInterface;
}

export interface InviteMemberModalProps {
  open: boolean;
  store?: Store;
  onClose: () => void;
}

export interface RegisterFormProps {
  index: number;
}

export interface DeleteModalProps {
  team: boolean;
  teamId?: string;
  name?: string;
  memberId?: string | string[];
  userId?: string;
  router: NextRouter;
  teamStore?: Team;
  initialState: InitialStateInterface;
  store?: Store;
  onClose?: () => void;
}

export interface AddTeamModalProps {
  edit: boolean;
  teamName?: string;
  teamId?: string;
  store?: Store;
  teamStore?: Team;
  router: NextRouter;
  aboutTeam?: string;
  onClose?: () => void;
}

//Temporary interface might change later
export interface RolesTableProps {
  deleteRole: (user: any) => void;
  data: RoleTableInterface[];
}

export interface OnboardingHeaderProps {
  teamSlug?: string;
  firstGridItem?: boolean;
  children: React.ReactNode;
  teamRequired?: boolean;
  store?: Store;
  router: NextRouter;
  isMobile?: boolean;
  initialState: InitialStateInterface;
  width?: string;
}

export interface TransferAccountForm {
  email: string;
  organizationName: string;
}

export interface TransferAccountModalProps {
  store?: Store;
  setIsTransferred: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface LayoutProps extends OnboardingHeaderProps {
  upgrade?: boolean;
}

export interface OrganizationModalForm {
  organizationName: string;
}

export interface InviteMemberModalForm {
  email: string;
  role: string;
  extraMembers: Array<Record<string, any>> | undefined;
}

export interface NewTeamModalForm {
  teamName: string;
  aboutTeam: string;
}

export interface StacksProps {
  store: Store;
  stackStore: Stacks;
  upgrade?: boolean;
  isTL: boolean;
  router: NextRouter;
  isMobile: boolean;
  initialState: InitialStateInterface;
}

export interface StacksState {
  loading: boolean;
  isCopy: boolean;
  disabled: boolean;
  search: string;
  showModal: boolean;
}

export interface RolesInterface {
  role: string[];
}

export interface FeedbackProps {
  router: NextRouter;
  store: Store;
  isTL: boolean;
  isMobile: boolean;
  cannyToken: string;
  initialState: InitialStateInterface;
}

export interface FeedbackState {
  loading: boolean;
}

export interface ProfileSettingsState {
  newFirstName: string;
  newLastName: string;
  newAvatarUrl: string;
  defaultTeamSlug: string;
  isEdit: boolean;
  src: any;
  fileUrl: any;
  crop: any;
  croppedImageUrl: any;
  srcName: string;
  srcType: string;
  disabled: boolean;
  isModalVisible: boolean;
  isShowModal: boolean;
}

export interface ProfileSettingsProps {
  store: Store;
  isTL: boolean;
  error?: string;
  isMobile: boolean;
  router: NextRouter;
  initialState: InitialStateInterface;
}

export interface UserInfoProps {
  store: Store;
  isTL: boolean;
  isMobile: boolean;
  initialState: InitialStateInterface;
}

export interface UserInfoState {
  newFirstName: string;
  newLastName: string;
  disabled: boolean;
  loading: boolean;
}

export interface DuplicateModalProps {
  aboutTeam: string;
  store?: Store;
  teamStore?: Team;
  onClose: () => void;
  router: NextRouter;
}

export interface DisclaimerProps extends UserInfoProps {
  planName: string;
  planId: string;
}

export interface OrganizationModalProps {
  router: NextRouter;
  onCollapse?: (collapsed: boolean) => void;
  store?: Store;
  open?: boolean;
  edit?: boolean;
}

export interface AddMemberModalProps {
  store?: Store;
  teamStore?: Team;
}

export interface UserDetails {
  lastName: string;
  firstName: string;
  email: string;
  _id: string;
}

export interface Paginate {
  pagingCounter: number;
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
}

export interface Roles {
  _id: string;
  role: string;
}

export interface ResponseObject {
  status: number;
  message: string;
}

export interface UserRoleDetails {
  role: string;
  user: {
    name: string;
    email: string;
  };
}

export interface StackIdState {
  stack: object;
  defaultAuth: string;
  disabled: boolean;
  loading: boolean;
  isDeploying: boolean;
  isShowModalStop: boolean;
  isShowModalDelete: boolean;
  isShowModalDeploy: boolean;
}

export interface StackIdProps {
  store: Store;
  stackStore: Stacks;
  isTL: boolean;
  router: NextRouter;
  isMobile: boolean;
  initialState: InitialStateInterface;
}

export interface NoResultPropsInterface {
  text: string;
  subText?: string;
}

export interface DateObjectInterface {
  date: number;
  hours: number;
  milliseconds: number;
  minutes: number;
  months: number;
  seconds: number;
  years: number;
}
export interface PlanCardProps {
  store?: Store;
}

export interface TransferVerificationProps {
  token: string;
  router: NextRouter;
}
export type PlansProps = UserInfoProps;

export interface OrganizationDetailPropsInterface {
  organization: Organization;
}

export interface DeleteOrganizationModalProps {
  store?: Store;
  initialState?: InitialStateInterface;
}

export interface StripeCardProps {
  card: CardInterface;
}
