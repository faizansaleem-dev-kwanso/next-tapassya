import { makeAutoObservable, runInAction } from 'mobx';
import { createStack, getStacks, updateStack, getStack, searchStack } from 'lib/api/stacks';
import { Store } from './index';
import {
  ActionsInterface,
  AddProjectBody,
  GetProjectParams,
  Lti11ObjectInterface,
  Lti13ObjectInterface,
  ProjectResponseInterface,
  UpdateProjectParams,
} from '../../interfaces/projectsInterface';
import { Paginate } from 'interfaces';

class Stacks {
  public store: Store;
  public _id: string;
  public deleted: boolean;
  public teamId: string;
  public name: string;
  public subDomain: string;
  public userId: string;
  public stage: string;
  public defaultAuth: 'generic' | 'lti11' | 'lti13';
  public namespace: string;
  public createdAt: string;
  public lti11?: Lti11ObjectInterface;
  public lti13?: Lti13ObjectInterface;
  public actions: [ActionsInterface];
  public organizationId: string;
  public isLoadingProjects = false;
  public id?: string;
  public paginate: Paginate;

  constructor(params) {
    makeAutoObservable(this);
    this.paginate = { totalDocs: 0, pagingCounter: 0, limit: 0, page: 0, totalPages: 0 };
    this.store = params.store;
    this._id = params._id;
    this.deleted = params.deleted;
    this.teamId = params.teamId;
    this.name = params.name;
    this.userId = params.userId;
    this.subDomain = params.subDomain;
    this.stage = params.stage;
    this.defaultAuth = params.defaultAuth;
    this.namespace = params.namespace;
    this.createdAt = params.createdAt;
    this.actions = params.actions;
    this.organizationId = params.organizationId;
    this.id = params.id;
  }

  public addStack = async (payload: AddProjectBody): Promise<ProjectResponseInterface> => {
    const data: ProjectResponseInterface = await createStack(payload);
    const stack = new Stacks({ ...data });

    runInAction(() => {
      this.store.stacks.push(stack);
    });

    return data;
  };

  public searchStack = async (params: GetProjectParams): Promise<void> => {
    const data: ProjectResponseInterface = await searchStack(params);
    runInAction(() => {
      this.paginate = data.paginator;
      this.store.stacks.replace(data.projects);
    });
  };

  public getAllStacks = async (params: GetProjectParams): Promise<void> => {
    this.isLoadingProjects = true;
    const data = await getStacks(params);
    if (data.status === 200) {
      const stackObjs = data.projects.map((stack) => new Stacks({ ...stack }));
      runInAction(() => {
        this.store.stacks.replace(stackObjs);
        this.paginate = { ...data.paginator };
        this.isLoadingProjects = false;
      });
    }
  };

  public getResourceStacks = async (): Promise<void> => {
    const stacks = [];
    let maximumPages = 50;
    const options = {
      organizationId: this.store.currentOrganization._id,
      page: 1,
      limit: 50,
    };
    for (let i = 1; i < maximumPages; i++) {
      const response = await getStacks(options);
      stacks.push(...response.projects);
      const paginator = response.paginator;
      options.page = i;
      maximumPages = paginator.totalPages;
    }
    runInAction(() => {
      this.store.resourceStacks.replace(stacks);
    });
  };

  public removeResourceStack = (id: string) => {
    const stack = this.store.resourceStacks.find((stack) => stack._id === id);
    runInAction(() => {
      this.store.resourceStacks.remove(stack);
    });
  };

  public async updateStack(params: UpdateProjectParams): Promise<ProjectResponseInterface> {
    const response = await updateStack(params);

    return response;
  }

  public getStackById = async (stackId: string | string[]): Promise<ProjectResponseInterface> => {
    const response = await getStack(stackId);

    return response;
  };
}

export { Stacks };
