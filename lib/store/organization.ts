import { InviteResponseInterface } from 'interfaces/inviteInterfaces';
import { deleteInvites, transferInvite } from 'lib/api/invitation';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  AddOrgParams,
  BillingId,
  OrganizationInterface,
  OrganizationResponse,
  TransferOrgParams,
  UpdateOrgParams,
} from '../../interfaces/organizationInterfaces';
import {
  createOrganization,
  deleteOrganization,
  getOrganizationDefaultTeam,
  updateOrganization,
} from '../api/organization';
import { Store } from './index';
class Organization {
  public rootStore: Store;

  public _id: string;
  public createdAt: string;
  public isDefaultOrganization: boolean;
  public isTransferred: boolean;
  public name: string;
  public ownerId: string;
  public slug: string;
  public isAccountDeactivate: boolean;
  public type: string;
  public updatedAt: string;
  public billingId: BillingId;
  public isLoading = true;

  constructor(params) {
    makeAutoObservable(this);
    this.rootStore = params.Store;
    this._id = params._id;
    this.createdAt = params.createdAt;
    this.isDefaultOrganization = params.isDefaultOrganization;
    this.isTransferred = params.isTransferred;
    this.name = params.name;
    this.isAccountDeactivate = params.isAccountDeactivate;
    this.ownerId = params.ownerId;
    this.slug = params.slug;
    this.type = params.type;
    this.updatedAt = params.updatedAt;
    this.billingId = params.billingId;
  }

  /**
   * This method sets organizations
   * @param organizations
   * @param selectedOrganizationSlug
   */
  public setOrganizations = (
    organizations: OrganizationInterface[],
    selectedOrganizationSlug?: string,
  ) => {
    const organizationObjs = organizations.map(
      (organization) => new Organization({ store: this, ...organization }),
    );

    if (organizations && organizations.length > 0 && !selectedOrganizationSlug) {
      selectedOrganizationSlug = organizationObjs[0].slug;
    }

    this.rootStore.organizations.replace(organizationObjs);

    if (selectedOrganizationSlug) {
      this.setCurrentOrganization(selectedOrganizationSlug);
    }
  };

  /**
   * This method sets current organization
   * @param slug
   * @returns
   */
  public setCurrentOrganization = async (slug: string | string[]): Promise<void> => {
    if (this.rootStore.currentOrganization) {
      if (this.rootStore.currentOrganization.slug === slug) {
        return;
      }
    }

    let found = false;

    for (const organization of this.rootStore.organizations) {
      if (organization.slug === slug) {
        found = true;
        this.isLoading = false;
        this.rootStore.currentOrganization = organization;
        break;
      }
    }
    if (!found) {
      this.rootStore.currentOrganization = null;
    }
  };

  public addOrganization = async (params: AddOrgParams): Promise<OrganizationResponse> => {
    const data: OrganizationResponse = await createOrganization({
      name: params.name,
    });
    if (data.status === 200) {
      runInAction(() => {
        const organization = new Organization({ store: this.rootStore, ...data.organization });
        this.rootStore.organizations.push(organization);
      });
    }
    return data;
  };

  /**
   * Removes organization
   * @param organizationId
   * @returns
   */
  public removeOrganization = async (organizationId: string): Promise<OrganizationResponse> => {
    const response: OrganizationResponse = await deleteOrganization(organizationId);
    if (response.status === 200) {
      runInAction(() => {
        const organization = this.rootStore.organizations.find(
          (organization) => organization._id === organizationId,
        );
        this.rootStore.organizations.remove(organization);
        this.rootStore.currentOrganization = this.rootStore.organizations[0];
      });
    }
    return response;
  };

  public editOrganization = async (params: UpdateOrgParams): Promise<OrganizationResponse> => {
    const response: OrganizationResponse = await updateOrganization({
      name: params.name,
      organizationId: params.organizationId,
    });
    if (response.status === 200) {
      runInAction(() => {
        const organization = this.rootStore.organizations.find(
          (organization) => organization._id === params.organizationId,
        );
        organization.name = response.organization.name;
      });
    }
    return response;
  };

  public transferOrganization = async (
    params: TransferOrgParams,
  ): Promise<InviteResponseInterface> => {
    const response = await transferInvite(params);
    if (response.status === 200) {
      runInAction(() => {
        this.rootStore.currentOrganization.isTransferred = true;
      });
    }
    return response;
  };

  public transferInviteAccepted = async (slug: string | string[]): Promise<Organization> => {
    runInAction(() => {
      const organization = this.rootStore.organizations.find(
        (organization) => organization.slug === slug,
      );
      this.rootStore.currentOrganization = this.rootStore.organizations[0];
      this.rootStore.organizations.remove(organization);
    });

    return this.rootStore.organizations[0];
  };

  public abortTransferOrganization = async (id: string): Promise<InviteResponseInterface> => {
    const response = await deleteInvites(id);
    if (response.status === 200) {
      runInAction(() => {
        this.rootStore.currentOrganization.isTransferred = false;
      });
    }
    return response;
  };

  public async setDefaultTeam(organizationId: string) {
    const data = await getOrganizationDefaultTeam(organizationId);
    runInAction(() => {
      this.rootStore.defaultTeam = data.team;
    });
  }
}

export { Organization };
