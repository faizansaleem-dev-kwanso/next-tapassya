/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import '../../../../../styles/Teams.module.less';
import {
  Card,
  Avatar,
  Breadcrumb,
  Row,
  Col,
  Button,
  Typography,
  Badge,
  Form,
  Select,
  Pagination,
  Skeleton,
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import Layout from '../../../../../components/layout/index';
import TeamCard from '../../../../../components/teams/teamCard';
import RoleTable from '../../../../../components/teams/rolesTable';
import { getStatusAndComment } from '../../../../../lib/stackStatus';
import { UserRoleDetails, TeamPageProps } from 'interfaces';
import { ActionsInterface, ProjectCardInterface } from 'interfaces/projectsInterface';
import { TeamMemberResponse, RoleTableInterface } from 'interfaces/teamInterfaces';
import { RoleResponseInterface } from 'interfaces/roleInterfaces';
import { UserInterface } from 'interfaces/userInterfaces';
import { getTeamMember } from '../../../../../lib/api/team-member';
import { getUserRoles, deleteUserRole, addUserRole } from '../../../../../lib/api/role';
import { withAuth } from '../../../../../lib/auth';
import notify from '../../../../../lib/notifier';
import { PAGE_SIZE, COMMON_ENTITY } from '../../../../../lib/consts';
import NoResult from 'components/common/NoResult';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';
import { capitalize } from 'lodash';

type Display = 'teams' | typeof COMMON_ENTITY | 'roles';

const { Title } = Typography;
const { Option } = Select;

/**
 * This is a page which shows team member details including his/her
 * Teams, Projects and Assigned Roles
 * @param props
 * @returns
 */
const Test: FC<TeamPageProps> = (props): JSX.Element => {
  // Constants
  const { router, initialState } = props;
  const currentTeam = initialState.selectedTeam.team;
  const { teamStore, userStore, stackStore, teams, stacks, currentOrganization } = props.store;
  const { isLoadingTeams } = teamStore;
  const { isLoadingProjects } = stackStore;
  const { userRoles, projectsCount, teamCount } = userStore;

  // States
  const [roles, setRoles] = useState<string[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [display, setDisplay] = useState<Display>('teams');
  const [userDetails, setUserDetails] = useState<Partial<UserInterface>>({});
  const [tableData, setTableData] = useState<RoleTableInterface[]>([]);
  const [form] = Form.useForm();

  // This function gets member details of team member
  const getMemberDetails = async () => {
    const teamMember: TeamMemberResponse = await getTeamMember(router.query.memberId);
    setUserDetails(teamMember.teamMember.userId);
    setLoadingDetails(false);
  };

  useEffect(() => {
    getMemberDetails();
    userStore.getUserTeams({ memberId: router.query.memberId, page: 1 });
    userStore.getUserProjects({ page: 1 });
    userStore.getRoles();
  }, []);

  const handleChange = (e: string[]): void => {
    setRoles(e);
  };

  // This function handles pagination
  const handlePagination = (page: number): void => {
    display === 'teams'
      ? userStore.getUserTeams({ memberId: router.query.memberId, page: page })
      : -userStore.getUserProjects({ page: page });
  };

  /**
   * This function deletes user role
   * @param user
   */
  const deleteRole = async (user: UserRoleDetails): Promise<void> => {
    const index = userRoles.findIndex((role) => role.role === user.role);
    const response: RoleResponseInterface = await deleteUserRole({
      userId: userDetails._id,
      roleId: userRoles[index]._id,
    });
    if (response.status === 200) {
      setTableData(tableData.filter((data) => data.role !== user.role));
      notify(response.message, 'success');
    } else {
      notify(response.message, 'error');
    }
  };

  // This function adds user role
  const addRole = async (): Promise<void> => {
    roles.forEach(async (role) => {
      const index = userRoles.findIndex((item) => item.role === role);
      const data = {
        userId: userDetails._id,
        roleId: userRoles[index]._id,
      };
      const response: RoleResponseInterface = await addUserRole(data);
      if (response.status === 200) {
        setTableData((prev) => [
          ...prev,
          {
            user: {
              name: userDetails.firstName + ' ' + userDetails.lastName,
              email: userDetails.email,
              avatarUrl: userDetails.avatarUrl,
            },
            key: userDetails._id,
            role: role,
          },
        ]);
        form.resetFields();
        setRoles([]);
        notify(response.message, 'success');
      } else {
        notify(response.message, 'error');
      }
    });
  };

  /**
   * This function switches different views like team, projects and roles
   * @param display
   */
  const handleClick = async (display: Display): Promise<void> => {
    if (display === COMMON_ENTITY) {
      await userStore.getUserProjects({ page: 1 });
    } else if (display === 'roles') {
      const data: RoleResponseInterface = await getUserRoles(userDetails._id);
      const mappedData = data.roles.map((role) => {
        return {
          user: {
            name: userDetails.firstName + ' ' + userDetails.lastName,
            email: userDetails.email,
            avatarUrl: userDetails.avatarUrl,
          },
          key: userDetails._id,
          role: role.role,
        };
      });
      setTableData(mappedData);
    }
    setDisplay(display);
  };

  // This function renders the roles view
  const RenderAssignRoles = (): JSX.Element => {
    return (
      <div className="teams-data">
        <h3>Assign Roles</h3>
        <div>
          <Form onFinish={addRole} form={form} className="d-flex assign-role-filter">
            <Form.Item name="roles">
              <Select
                autoClearSearchValue={true}
                placeholder={
                  <>
                    <SearchOutlined /> Search Roles
                  </>
                }
                mode="multiple"
                onChange={handleChange}
              >
                {userRoles.map((role, index) => (
                  <Option key={index} value={role.role}>
                    {role.role.charAt(0).toUpperCase() + role.role.slice(1).toLowerCase()}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Button htmlType="submit" type="primary" disabled={roles.length !== 0 ? false : true}>
              Add Role
            </Button>
          </Form>
          <RoleTable deleteRole={deleteRole} data={tableData}></RoleTable>
        </div>
      </div>
    );
  };

  // This function renders team view
  const RenderTeamCard = (): JSX.Element => {
    const { totalDocs, limit, pagingCounter, page } = teamStore.paginate;
    return (
      <div className="teams-data">
        <h3>Teams</h3>
        <div className="d-flex-teams">
          {isLoadingTeams && (
            <Row gutter={15}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Col key={n} span={8} xl={8} lg={12} md={12} sm={12} xs={24}>
                  <Card style={{ width: 300, marginTop: 16 }} loading>
                    <Card.Meta title="Card title" description="This is the description" />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          {!isLoadingTeams && (
            <>
              {teams.map((team, index) => (
                <TeamCard
                  key={index}
                  initialState={initialState}
                  defaultTeam={team.defaultTeam}
                  title={team.name}
                  content={team.description}
                  teamId={team._id}
                  memberDetailView={true}
                  slug={team.slug}
                  memberView={true}
                />
              ))}
            </>
          )}
        </div>
        {totalDocs > 6 && !isLoadingTeams && (
          <div className="pagination-illumidesk">
            <p>
              Showing {pagingCounter !== 1 ? pagingCounter - 1 : pagingCounter} to{' '}
              {pagingCounter - 1 + limit > totalDocs ? totalDocs : pagingCounter - 1 + limit} of{' '}
              {totalDocs} results
            </p>
            <Pagination
              pageSize={PAGE_SIZE}
              current={page}
              total={totalDocs}
              onChange={handlePagination}
            />
          </div>
        )}
      </div>
    );
  };

  //This function renders project view
  const RenderStackCard = (): JSX.Element => {
    const { totalDocs, limit, pagingCounter, page } = stackStore.paginate;
    return (
      <div className="teams-data">
        <h3>{Pluralize(capitalize(COMMON_ENTITY))}</h3>
        <div className="d-flex-teams">
          {isLoadingProjects && (
            <Row gutter={15}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <Col key={n} span={8} xl={8} lg={12} md={12} sm={12} xs={24}>
                  <Card style={{ width: 300, marginTop: 16 }} loading>
                    <Card.Meta title="Card title" description="This is the description" />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          {!isLoadingTeams && stacks.length === 0 && (
            <div className="not-found-data">
              <NoResult
                subText={`This member is not added into any ${capitalize(
                  COMMON_ENTITY,
                )} right now!`}
                text={`No ${capitalize(COMMON_ENTITY)} Found`}
              />
            </div>
          )}
          {!isLoadingProjects && stacks.length > 0 && (
            <>
              {stacks.map((stack) => (
                <StackCard
                  key={stack._id}
                  id={stack._id}
                  name={stack.name}
                  subDomain={stack.subDomain}
                  actions={stack.actions}
                  stage={stack.stage}
                  setIsCopied={() => {}}
                  isCopy={false}
                />
              ))}
            </>
          )}
        </div>
        {totalDocs > 6 && !isLoadingProjects && (
          <div className="pagination-illumidesk">
            <p>
              Showing {pagingCounter !== 1 ? pagingCounter - 1 : pagingCounter} to{' '}
              {pagingCounter - 1 + limit > totalDocs ? totalDocs : pagingCounter - 1 + limit} of{' '}
              {totalDocs} results
            </p>
            <Pagination
              pageSize={PAGE_SIZE}
              current={page}
              total={totalDocs}
              onChange={handlePagination}
            />
          </div>
        )}
      </div>
    );
  };

  // This function get status of project
  const getStatusFromActions = (actions: [ActionsInterface]): JSX.Element => {
    const { className, text, classNameDot, comment } = getStatusAndComment(actions);
    return (
      <div className="status-grid">
        <Title level={5}>Status</Title>
        <Badge className={className}>
          <div className={classNameDot}></div>
          {comment === 'De-provisioning' ? 'De-provisioning' : text}
        </Badge>
      </div>
    );
  };

  // This function renders project card with project details
  const StackCard = (stack: ProjectCardInterface): JSX.Element => {
    const { id, name, subDomain, actions } = stack;
    return (
      <Card className="stacks-card">
        <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}/${id}`}>
          <a>
            <Title level={5}>{name}</Title>
            <p>{`${subDomain}.illumidesk.com`}</p>
            {getStatusFromActions(actions)}
          </a>
        </Link>
      </Card>
    );
  };

  return (
    <Layout {...props}>
      <Head>
        <title>User Details</title>
        <meta name="description" content="Create a new Team" />
      </Head>
      {currentOrganization.isTransferred && <OrganizationNotification />}
      <Breadcrumb className="breadcrumb">
        <Breadcrumb.Item>
          <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`}>
            <a>
              <span className="breadcrumb__inner">
                <img src="/home.svg" alt="home" />
              </span>
            </a>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href={`/${currentOrganization.slug}/team`}>
            <a>
              <span className="breadcrumb__inner">Teams</span>
            </a>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href={`/${currentOrganization.slug}/team/${currentTeam.slug}`}>
            <a>
              <span className="breadcrumb__inner">{initialState.selectedTeam.team.name}</span>
            </a>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a>
            <span className="breadcrumb__inner">
              {userDetails.firstName} {userDetails.lastName}
            </span>
          </a>
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="profile-info">
        <a onClick={() => router.back()}>
          <img src="/chevron-left.svg" alt="back" /> Back
        </a>
      </div>

      <div className="member-profile">
        <Card
          actions={[
            <Button
              type="link"
              key="1"
              className={display === 'teams' ? 'ant-btn-link-active teams' : ''}
              onClick={() => handleClick('teams')}
            >
              {' '}
              {teamCount} {teamCount > 1 ? 'Teams' : 'Team'}
            </Button>,
            <Button
              type="link"
              key="2"
              className={display === COMMON_ENTITY ? 'ant-btn-link-active' : ''}
              onClick={() => handleClick(COMMON_ENTITY)}
            >
              {' '}
              {projectsCount}{' '}
              {projectsCount > 1
                ? `${capitalize(Pluralize(COMMON_ENTITY))}`
                : `${capitalize(COMMON_ENTITY)}`}
            </Button>,
            <Button
              type="link"
              key="3"
              className={display === 'roles' ? 'ant-btn-link-active roles' : ''}
              onClick={() => handleClick('roles')}
            >
              {' '}
              Assigned Roles
            </Button>,
          ]}
        >
          {loadingDetails && (
            <Skeleton avatar={{ size: 75 }} paragraph={{ rows: 1, width: '50%' }} active />
          )}
          {!loadingDetails && (
            <div className="flex-members-profile">
              <div className="profile-avatar">
                <Avatar
                  size={70}
                  style={{ backgroundColor: 'grey' }}
                  icon={
                    userDetails.avatarUrl !== '' || null ? (
                      <img src={userDetails.avatarUrl} />
                    ) : (
                      <UserOutlined />
                    )
                  }
                />
              </div>

              <div className="card-text">
                <h5>{userDetails.firstName + ' ' + userDetails.lastName}</h5>
                <p>{userDetails.email}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {display === 'roles'
        ? RenderAssignRoles()
        : display === 'teams'
        ? RenderTeamCard()
        : RenderStackCard()}
    </Layout>
  );
};

export const getServerSideProps = withAuth(null, { dontRedirect: true });
export default withRouter<TeamPageProps>(inject('store')(observer(Test)));
