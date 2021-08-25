import * as mobx from 'mobx';

import { IObservableArray, makeAutoObservable, observable, runInAction } from 'mobx';

import { IS_DEV } from '../consts';
import { Team } from './team';
import { Organization } from './organization';
import { Stacks } from './stacks';
import { User } from './user';
import { TeamInterface } from 'interfaces/teamInterfaces';
import { ProjectInterface } from 'interfaces/projectsInterface';
import { InitialStateInterface } from 'interfaces';
import { PlansEntity } from 'interfaces/organizationInterfaces';

mobx.configure({ enforceActions: 'observed' });

class Store {
  public isServer: boolean;
  public isOrgTransfered: boolean;
  public teams: IObservableArray<Team> = observable([]);
  public organizations: IObservableArray<Organization> = observable([]);
  public stacks: IObservableArray<ProjectInterface> = observable([]);
  public plans: PlansEntity[] = [];
  public teamStore: Team;
  public stackStore: Stacks;
  public userStore: User;
  public organizationStore: Organization;
  public currentUser?: User = null;
  public currentTeam?: Team;
  public defaultTeam?: TeamInterface;
  public currentOrganization?: Organization;
  public currentUrl = '';
  public teamSlug = '';
  public isLoggingIn = true;
  public socket: SocketIOClient.Socket;

  constructor({
    initialState,
    isServer,
  }: {
    initialState?: InitialStateInterface;
    isServer: boolean;
    socket?: SocketIOClient.Socket;
  }) {
    makeAutoObservable(this);
    this.isServer = !!isServer;

    this.teamStore = new Team({ store: this });
    this.stackStore = new Stacks({ store: this });
    this.organizationStore = new Organization({ Store: this });
    this.userStore = new User({ store: this });
    if (initialState) {
      const { user, selectedTeam, organizations, selectedSlug, currentUrl, plans } = initialState;
      if (user) {
        this.setCurrentUser(initialState.user);
      }
      if (plans) {
        this.plans = plans;
      }
      if (selectedTeam) {
        const newTeam = new Team({ ...selectedTeam.team });
        this.currentTeam = newTeam;
      }

      if (organizations) {
        if (selectedSlug) {
          this.organizationStore.setOrganizations(organizations, selectedSlug);
        } else {
          this.organizationStore.setOrganizations(organizations, null);
        }
      }
      this.currentUrl = currentUrl || '';
    }
  }

  public setSocket = async (socket: SocketIOClient.Socket) => {
    runInAction(() => {
      this.socket = socket;
    });
  };

  public changeCurrentUrl(url: string) {
    this.currentUrl = url;
  }

  public setCurrentTeam = async (slug: string | string[]): Promise<void> => {
    if (this.currentTeam) {
      if (this.currentTeam.slug === slug) {
        return;
      }
    }

    let found = false;

    for (const team of this.teams) {
      if (team.slug === slug) {
        found = true;
        this.currentTeam = team;
        break;
      }
    }

    if (!found) {
      this.currentTeam = null;
    }
  };

  private async setCurrentUser(user) {
    if (user) {
      this.currentUser = new User({ store: this, ...user });
    } else {
      this.currentUser = null;
    }

    runInAction(() => {
      this.isLoggingIn = false;
    });
  }
}

let store: Store = null;

function initStore(initialState: InitialStateInterface) {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    return new Store({ initialState, isServer: true });
  } else {
    const win: any = window;

    if (!store) {
      if (IS_DEV) {
        // save initialState globally and use saved state when initialState is empty
        // initialState becomes "empty" on some HMR
        if (!win.__INITIAL_STATE__) {
          // TODO: when store changed, save it to win.__INITIAL_STATE__. So we can keep latest store for HMR
          win.__INITIAL_STATE__ = initialState;
        } else if (Object.keys(initialState).length === 0) {
          initialState = win.__INITIAL_STATE__;
        }
      }

      store = new Store({ initialState, socket: null, isServer: false });

      if (IS_DEV) {
        win.__STORE__ = store;
      }
    }

    return store || win.__STORE__;
  }
}

function getStore() {
  return (typeof window !== 'undefined' && (window as any).__STORE__) || store;
}

export { Team, User, Store, initStore, getStore };
