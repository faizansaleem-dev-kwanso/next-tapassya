/* eslint-disable react/prop-types */
import React, { FC, useEffect, useState } from 'react';
import Layout from '../../../components/layout/index';
import { withRouter } from 'next/router';
import Link from 'next/link';
import { inject, observer } from 'mobx-react';
import { withAuth } from '../../../lib/auth';
import Head from 'next/head';
import { Row, Col, Pagination, Card, Input, Breadcrumb } from 'antd';
import TeamCard from '../../../components/teams/teamCard';
import { TeamPageProps } from '../../../interfaces/index';
import NewTeamModal from '../../../components/teams/newTeamModal';
import { PAGE_SIZE, COMMON_ENTITY } from 'lib/consts';
import NoResult from 'components/common/NoResult';
import { SearchOutlined } from '@ant-design/icons';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';

const Teams: FC<TeamPageProps> = (props): JSX.Element => {
  // States
  const [search, setSearch] = useState<string>('');

  // Constants
  const pageSize: number = PAGE_SIZE;
  const { store, initialState } = props;
  const { currentOrganization, teams, teamStore } = store;
  const { isLoadingTeams } = teamStore;
  const { searchTeam } = teamStore;
  const { totalDocs, limit, pagingCounter, page } = teamStore.paginate;

  // This function gets teams
  const getTeams = async ({ page }: { page: number }) => {
    await teamStore.getTeams({
      organizationId: currentOrganization._id,
      page: page,
      limit: PAGE_SIZE,
    });
  };

  // This function handles pagination
  const handlePagination = async (page: number): Promise<void> => {
    if (search.length >= 3) {
      await searchTeam({
        organizationId: currentOrganization._id,
        search: search,
        page: page,
        limit: PAGE_SIZE,
      });
    } else {
      getTeams({ page: page });
    }
  };

  /**
   * This function handles search
   * @param event
   */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value.replace(/[^a-zA-Z0-9 ]/g, ''));
  };

  useEffect(() => {
    getTeams({ page: 1 });
  }, []);

  useEffect(() => {
    if (search.length === 0) {
      getTeams({ page: 1 });
    } else if (search.length >= 3) {
      searchTeam({
        organizationId: currentOrganization._id,
        search: search,
        page: 1,
        limit: PAGE_SIZE,
      });
    }
  }, [search]);

  return (
    <Layout {...props}>
      <Head>
        <title>Teams</title>
        <meta name="description" content="Teams" />
      </Head>
      {currentOrganization.isTransferred && <OrganizationNotification />}
      <Breadcrumb className="breadcrumb">
        <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`}>
          <a>
            <span className="breadcrumb__inner">
              <img src="/home.svg" alt="home" />
            </span>
          </a>
        </Link>
        <a>
          <span className="breadcrumb__inner">Teams</span>
        </a>
      </Breadcrumb>
      <div className="main-wrapper">
        <div className="page-header-stacks">
          <div className="search-input">
            <h4>Team</h4>

            <Input
              size="large"
              placeholder="Search"
              value={search}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
              className="search-input-desktop"
            />
          </div>

          <NewTeamModal edit={false} />
        </div>

        <div>
          <div className="search-input search-input-mobile">
            <Input
              size="large"
              placeholder="Search"
              value={search}
              onChange={handleSearch}
              prefix={<SearchOutlined />}
            />
          </div>
          {isLoadingTeams && search.length === 0 && (
            <div>
              <Row gutter={15}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Col key={n} span={8} xl={8} lg={12} md={12} sm={12} xs={24}>
                    <Card style={{ width: 300, marginTop: 16 }} loading>
                      <Card.Meta title="Card title" description="This is the description" />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>

        {!isLoadingTeams && teams.length === 0 && (
          <div className="not-found-data">
            <NoResult subText="No Teams found with this name" text="No Teams Found" />
          </div>
        )}
        {!isLoadingTeams && teams.length > 0 && (
          <div className="d-flex-teams">
            {teams.map((team, index) => (
              <TeamCard
                key={index}
                initialState={initialState}
                title={team.name}
                defaultTeam={team.defaultTeam}
                content={team.description}
                slug={team.slug}
                teamId={team._id}
                memberView={false}
              />
            ))}
          </div>
        )}
        {totalDocs > 6 && !isLoadingTeams && (
          <div className="pagination-illumidesk">
            <p>
              Showing {pagingCounter !== 1 ? pagingCounter - 1 : pagingCounter} to{' '}
              {pagingCounter - 1 + limit > totalDocs ? totalDocs : pagingCounter - 1 + limit} of{' '}
              {totalDocs} results
            </p>
            <Pagination
              pageSize={pageSize}
              current={page}
              total={totalDocs}
              onChange={handlePagination}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps = withAuth(null, { dontRedirect: true });

export default withRouter<TeamPageProps>(inject('store', 'teamStore')(observer(Teams)));
