import { IObservableArray, makeAutoObservable, observable, runInAction } from 'mobx';
import {
  addTeam,
  updateTeam,
  removeTeam,
  getTeamList,
  searchTeams,
  getAllTeams,
} from '../api/team-leader';
import {
  getMemberList,
  addMember,
  removeTeamMember,
  searchTeamMember,
  removeTeamMemberFromOrganization,
} from '../api/team-member';
import { Store } from './index';
import { Paginate } from 'interfaces';
import {
  TeamMemberInterface,
  TeamMemberResponse,
  TeamResponse,
  GetTeamResponse,
  TeamParamsInterface,
  TeamMemberParamsInterface,
  AddTeamParams,
  UpdateTeamParams,
  MembersToAddInterface,
  GetMemberOrTeamParams,
} from '../../interfaces/teamInterfaces';
import { PAGE_SIZE } from 'lib/consts';
class Team {
  public store: Store;
  public _id: string;
  public teamLeaderId: string;
  public defaultTeam: boolean;
  public name: string;
  public paginate: Paginate;
  public description: string;
  public slug: string;
  public avatarUrl: string;
  public isPaidSubscriptionActive: boolean;
  public isPaymentFailed: boolean;
  public members: IObservableArray<TeamMemberInterface> = observable([]);
  public stripeSubscription: {
    id: string;
    object: string;
    application_fee_percent: number;
    billing: string;
    cancel_at_period_end: boolean;
    billing_cycle_anchor: number;
    canceled_at: number;
    created: number;
  };
  public isLoadingMembers = false;
  public isLoadingTeams = false;

  constructor(params) {
    makeAutoObservable(this);
    this.paginate = { totalDocs: 0, pagingCounter: 0, limit: 0, page: 0, totalPages: 0 };
    this._id = params._id;
    this.teamLeaderId = params.teamLeaderId;
    this.defaultTeam = params.defaultTeam;
    this.slug = params.slug;
    this.description = params.description;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
    this.members.replace([]);
    this.isPaidSubscriptionActive = params.isPaidSubscriptionActive;
    this.stripeSubscription = params.stripeSubscription;
    this.isPaymentFailed = params.isPaymentFailed;
    this.store = params.store;
  }

  /**
   * Adds team
   * @param params
   * @returns response
   */
  public addTeam = async (params: AddTeamParams): Promise<TeamResponse> => {
    const data: TeamResponse = await addTeam(params);
    runInAction(() => {
      this.getTeams({
        organizationId: this.store.currentOrganization._id,
        page: 1,
        limit: PAGE_SIZE,
      });
    });
    return data;
  };

  /**
   * Deletes team
   * @param { teamId }
   * @returns response
   */ 4;
  public deleteTeam = async (teamId: string): Promise<TeamResponse> => {
    const data: TeamResponse = await removeTeam(teamId);
    const team = this.store.teams.find((team) => team._id === teamId);
    runInAction(() => {
      this.store.teams.remove(team);
      this.getTeams({
        organizationId: this.store.currentOrganization._id,
        page: 1,
        limit: PAGE_SIZE,
      });
    });
    return data;
  };

  /**
   * Gets teams
   * @param params
   * @returns
   */
  public getTeams = async (params: TeamParamsInterface): Promise<void> => {
    this.isLoadingTeams = true;
    const data: GetTeamResponse = await getTeamList(params);
    if (data.status === 200) {
      const teamObjs = data.teams.map((t) => new Team({ ...t }));
      runInAction(() => {
        this.store.defaultTeam = data.teams[0];
        this.store.teams.replace(teamObjs);
        this.paginate = { ...data.paginator };
        this.isLoadingTeams = false;
      });
    } else if (data.status === 401) {
    }
  };

  /**
   * Get organization teams of team
   */
  public getOrganizationTeams = async (): Promise<void> => {
    const currentOrganization = this.store.currentOrganization;
    const data: GetTeamResponse = await getAllTeams(currentOrganization._id);
    const teamObjs = data.teams.map((t) => new Team({ ...t }));
    runInAction(() => {
      this.store.teams.replace(teamObjs);
    });
  };

  /**
   * Search team of teams
   */
  public searchTeam = async (params: TeamParamsInterface): Promise<void> => {
    const response: TeamResponse = await searchTeams(params);
    if (response.status === 200) {
      const teamObjs = response.teams.map((t) => new Team({ ...t }));
      runInAction(() => {
        this.store.teams.replace(teamObjs);
        this.paginate = { ...response.paginator };
      });
    }
  };

  /**
   * Updates team
   * @param params
   * @returns team
   */
  public updateTeam = async (params: UpdateTeamParams): Promise<TeamResponse> => {
    const data: TeamResponse = await updateTeam(params);
    if (data.status === 200) {
      const team = new Team({ ...data.team });
      runInAction(() => {
        const index = this.store.teams.findIndex((storeTeam) => storeTeam._id === team._id);
        this.store.teams[index] = team;
      });
    }
    return data;
  };

  /**
   * Adds member to team
   * @param data
   * @param teamId
   * @returns response
   */
  public addMemberToTeam = async (
    params: MembersToAddInterface[],
    teamId: string,
  ): Promise<TeamMemberResponse> => {
    try {
      const response: TeamMemberResponse = await addMember({ members: params });
      runInAction(() => {
        this.setTeamMembers({ teamId: teamId, page: 1, limit: 6 });
      });
      return response;
    } catch (error) {
      return error;
    }
  };

  public searchTeamMembers = async (params: TeamMemberParamsInterface): Promise<void> => {
    const response: TeamMemberResponse = await searchTeamMember(params);
    if (response.status === 200) {
      runInAction(() => {
        this.members.replace(response.teamMembers);
        this.paginate = { ...response.paginator };
      });
    }
  };

  /**
   * Sets team members
   * @param params
   */
  public setTeamMembers = async (params: GetMemberOrTeamParams): Promise<void> => {
    runInAction(() => {
      this.isLoadingMembers = true;
    });
    const data = await getMemberList(params);
    if (data.status === 200) {
      runInAction(() => {
        this.members.replace(data.teamMembers);
        this.paginate = { ...data.paginator };
        this.isLoadingMembers = false;
      });
    }
  };

  /**
   * Deletes team member
   * @param memberId
   * @returns response
   */
  public deleteTeamMember = async (memberId: string | string[]): Promise<TeamMemberResponse> => {
    try {
      const response: TeamMemberResponse = await removeTeamMember(memberId);
      if (response.status === 200) {
        runInAction(() => {
          const member = this.members.find((member) => member._id === memberId);
          this.members.remove(member);
        });
        this.setTeamMembers({ teamId: this.store.currentTeam._id, page: 1, limit: 6 });
        return response;
      }
    } catch (error) {
      return error;
    }
  };

  /**
   * Delete team member from organization of team
   */
  public deleteTeamMemberFromOrganization = async ({
    userId,
    memberId,
    organizationId,
  }: {
    userId: string;
    memberId: string | string[];
    organizationId: string;
  }): Promise<TeamMemberResponse> => {
    try {
      const response: TeamMemberResponse = await removeTeamMemberFromOrganization(
        userId,
        organizationId,
      );
      if (response.status === 200) {
        runInAction(() => {
          const member = this.members.find((member) => member._id === memberId);
          this.members.remove(member);
        });
        this.setTeamMembers({ teamId: this.store.currentTeam._id, page: 1, limit: 6 });
        return response;
      }
    } catch (error) {}
  };
}

export { Team };
