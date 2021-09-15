import { InviteInterface } from './inviteInterfaces';
import { ProjectInterface } from './projectsInterface';
import { TeamInterface } from './teamInterfaces';
export interface OrganizationInterface {
  isDefaultOrganization: boolean;
  type: string;
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  createdAt: string;
  billingId: BillingId;
  updatedAt: string;
}

export interface ResourcesInterface {
  id: string;
  name: string;
  billingId: BillingId;
  isDefaultOrganization: boolean;
  isTransferred: boolean;
  projects: ProjectInterface[];
  teams: TeamInterface[];
}

export interface PlansEntity {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  livemode: boolean;
  lookup_key?: null;
  metadata: Metadata;
  nickname: string;
  product: string;
  recurring: Recurring;
  tiers_mode?: null;
  transform_quantity?: null;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

export interface Metadata {
  Bullet_Team?: string | null;
  Bullet_Organization?: string | null;
  Bullet_Project?: string | null;
  Bullet_Notebook?: string | null;
  Bullet_Title?: string | null;
  Bullet_Trial?: string | null;
  Conditional_Campus?: string | null;
  Conditional_Team?: string | null;
}

export interface Recurring {
  aggregate_usage?: null;
  interval: string;
  interval_count: number;
  trial_period_days?: null;
  usage_type: string;
}

export interface OrganizationResponse {
  status: number;
  message: string;
  found?: boolean;
  plans?: PlansEntity[];
  invitation?: InviteInterface;
  organization?: OrganizationInterface;
  organizations?: OrganizationInterface[];
  team?: TeamInterface;
  resources?: ResourcesInterface[];
}

export interface MemberDetails {
  _id: string;
  userId: {
    _id: string;
    createdAt: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
  };
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardInterface {
  id: string;
  object: string;
  billing_details: {
    address: {
      city: string | null;
      country: string;
      line1: string | null;
      line2: string | null;
      postal_code: number | string | null;
      state: string;
    };
    email: string;
    name: string;
    phone: number | string | null;
  };
  card: {
    brand: string;
    checks: {
      address_line1_check: string | null;
      address_postal_code_check: string | null;
      cvc_check: string;
    };
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    generated_from: string | null;
    last4: string;
    networks: {
      available: string[];
      preferred: string;
    };
    three_d_secure_usage: {
      supported: boolean;
    };
    wallet: string;
  };
  created: number;
  customer: string;
  livemode: boolean;
  metadata: {};
  type: string;
}

export interface OrganizationCardDetailsResponse {
  status: 200;
  message: string;
  card: CardInterface;
}

export interface BillingId {
  isPaidSubscriptionActive: boolean;
  isTrialProvisionedOnce: boolean;
  stripeSubscriptionId: string;
  isPaymentFailed: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  isCard: boolean;
  planId: string;
  planName: string;
  stripeCustomerId: string;
}

export interface AddOrgParams {
  name: string;
}

export interface UpdateOrgParams extends AddOrgParams {
  organizationId: string;
}

export interface TransferOrgParams {
  email: string;
  organizationId: string;
  type: string;
}
