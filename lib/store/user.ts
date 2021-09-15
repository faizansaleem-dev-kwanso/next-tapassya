import { makeAutoObservable, observable, runInAction, IObservableArray } from 'mobx';
import { toggleTheme, updateProfile, getTeamMemberTeams, getTeamMember } from '../api/team-member';
import { getTeamProjects } from 'lib/api/stacks';
import { getRoles } from 'lib/api/role';
import { PAGE_SIZE } from 'lib/consts';
import { Roles } from '../../interfaces/index';
import { TeamMemberResponse } from 'interfaces/teamInterfaces';
import { Store } from './index';
import { Team } from './team';
import { UpdateUserParams } from 'interfaces/userInterfaces';

class User {
  public store: Store;
  public _id: string;
  public slug: string;
  public email: string | null;
  public firstName: string | null;
  public lastName: string | null;
  public isActive: boolean;
  public avatarUrl: string | null;
  public defaultTeamSlug: string;
  public userRoles: IObservableArray<Roles> = observable([]);
  public darkTheme = true;
  public teamCount: number;
  public projectsCount: number;
  public isLoggedIn = false;

  constructor(params) {
    makeAutoObservable(this);
    this.store = params.store;
    this._id = params._id;
    this.slug = params.slug;
    this.email = params.email;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.avatarUrl = params.avatarUrl;
    this.defaultTeamSlug = params.defaultTeamSlug;
    this.darkTheme = !!params.darkTheme;
    this.isLoggedIn = !!params.isLoggedIn;
    this.isActive = params.isActive;
  }

  /**
   * Updates profile
   * @param {
   *     firstName,
   *     lastName,
   *     avatarUrl,
   *   }
   */
  public updateProfile = async (params: UpdateUserParams): Promise<void> => {
    const { updatedUser } = await updateProfile(params);
    runInAction(() => {
      this.firstName = updatedUser.firstName;
      this.lastName = updatedUser.lastName;
      this.avatarUrl = updatedUser.avatarUrl;
    });
  };

  /**
   * Toggles theme
   * @param darkTheme
   */
  public async toggleTheme(darkTheme: boolean) {
    this.darkTheme = darkTheme;
    await toggleTheme({ darkTheme });
    window.location.reload();
  }

  /**
   * Logins user
   */
  public login() {
    this.isLoggedIn = true;
  }

  /**
   * Logouts user
   */
  public logout() {
    this.isLoggedIn = false;
  }

  /**
   * Gets user teams
   * @param { memberId, page }
   */
  public getUserTeams = async ({
    memberId,
    page,
  }: {
    memberId: string | string[];
    page: number;
  }): Promise<void> => {
    runInAction(() => {
      this.store.teamStore.isLoadingTeams = true;
    });
    const teamMember = await getTeamMember(memberId);
    if (teamMember.status === 200) {
      const userId = teamMember.teamMember.userId._id;
      const data: TeamMemberResponse = await getTeamMemberTeams({
        userId: userId,
        page: page,
        limit: PAGE_SIZE,
      });
      if (data.status === 200) {
        const teamObjs = data.teams.map((t) => new Team({ ...t.teamId }));
        runInAction(() => {
          this.store.teams.replace(teamObjs);
          this.store.teamStore.paginate = data.paginator;
          this.store.teamStore.isLoadingTeams = false;
          this.teamCount = data.teamCount;
        });
      }
    }
  };

  /**
   * Gets user projects
   * @param { page }
   */
  public getUserProjects = async ({ page }: { page: number }): Promise<void> => {
    const currentTeam = this.store.currentTeam;
    if (currentTeam) {
      const data = await getTeamProjects({ teamId: currentTeam._id, page: page, limit: PAGE_SIZE });
      if (data.status === 200) {
        runInAction(() => {
          this.store.stacks.replace(data.projects);
          this.store.stackStore.paginate = data.paginator;
          this.projectsCount = data.projectCount;
        });
      }
    }
  };

  /**
   * Gets roles
   */
  public getRoles = async (): Promise<void> => {
    const data = await getRoles();
    if (data.status === 200) {
      const mappedData = data.roles.map((role) => {
        return {
          _id: role._id,
          role: role.role,
        };
      });
      runInAction(() => {
        this.userRoles.replace(mappedData);
      });
    }
  };
}

export { User };
