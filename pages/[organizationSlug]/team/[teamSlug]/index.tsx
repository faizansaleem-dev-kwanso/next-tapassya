/* eslint-disable react/prop-types */
import React, { FC, useEffect, useState } from 'react';
import { Pagination, Row, Col, Breadcrumb, Skeleton, Input } from 'antd';
import Layout from '../../../../components/layout/index';
import { withRouter } from 'next/router';
import Link from 'next/link';
import { inject, observer } from 'mobx-react';
import { withAuth } from '../../../../lib/auth';
import Head from 'next/head';
import MemberCard from '../../../../components/teams/teamMemberCard';
import '../../../../styles/Teams.module.less';
import { TeamPageProps } from '../../../../interfaces/index';
import AddMemberModal from '../../../../components/teams/addMemberModal';
import NoResult from 'components/common/NoResult';
import { COMMON_ENTITY, PAGE_SIZE } from 'lib/consts';
import { SearchOutlined } from '@ant-design/icons';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';

const ViewTeam: FC<TeamPageProps> = (props): JSX.Element => {
  // Constants
  const pageSize = PAGE_SIZE;
  const { teamStore, initialState, store } = props;
  const { currentOrganization } = store;
  const currentTeam = initialState.selectedTeam.team;
  const { isLoadingMembers } = teamStore;

  // States
  const [search, setSearch] = useState<string>('');
  const { paginate, searchTeamMembers, setTeamMembers } = teamStore;

  useEffect(() => {
    teamStore.setTeamMembers({
      teamId: currentTeam._id,
      page: 1,
      limit: PAGE_SIZE,
    });
  }, []);

  useEffect(() => {
    if (search.length >= 3) {
      searchTeamMembers({
        teamId: currentTeam._id,
        search: search,
        page: 1,
        limit: PAGE_SIZE,
      });
    } else if (search.length === 0) {
      setTeamMembers({ teamId: currentTeam._id, page: 1, limit: PAGE_SIZE });
    }
  }, [search]);

  // This function handles pagination
  const handlePagination = async (page: number) => {
    if (search.length >= 3) {
      await searchTeamMembers({
        teamId: currentTeam._id,
        search: search,
        page: page,
        limit: PAGE_SIZE,
      });
    } else {
      await setTeamMembers({
        teamId: currentTeam._id,
        page: page,
        limit: PAGE_SIZE,
      });
    }
  };

  /**
   * This function handles search
   * @param event
   */
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setSearch(event.target.value.replace(/[^a-zA-Z0-9 ]/g, ''));
  };

  return (
    <Layout {...props}>
      <Head>
        <title>{currentTeam.name}</title>
        <meta name="description" content="Create a new Team" />
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
        <Link href={`/${currentOrganization.slug}/team`}>
          <a>
            <span className="breadcrumb__inner">Teams</span>
          </a>
        </Link>
        <a>
          <span className="breadcrumb__inner">{currentTeam.name}</span>
        </a>
      </Breadcrumb>
      <div className="main-wrapper">
        <div className="page-header-stacks invite-team-header">
          <div className="search-input">
            <div className="d-flex">
              <h4>{currentTeam.name}</h4>
              {!isLoadingMembers && teamStore.members.length > 0 && (
                <Input
                  size="large"
                  placeholder="Search"
                  value={search}
                  onChange={handleSearch}
                  prefix={<SearchOutlined />}
                  className="search-input-desktop"
                />
              )}
            </div>

            {teamStore.members.length > 0 && (
              <div>
                <AddMemberModal />
              </div>
            )}
          </div>

          <div className="search-input-description">
            <p>{currentTeam.description}</p>
          </div>
        </div>

        <div className="search-input search-input-mobile">
          <Input
            size="large"
            placeholder="Search"
            value={search}
            onChange={handleSearch}
            prefix={<SearchOutlined />}
          />
        </div>
        {teamStore.members.length === 0 && !isLoadingMembers && (
          <div className="not-found-data">
            <NoResult
              subText="Click on the button below to add member to your team"
              text="No Members Found"
            />
            <AddMemberModal />
          </div>
        )}

        {isLoadingMembers && (
          <Row gutter={[15, 15]}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Col key={n} span={8} xl={8} lg={12} md={12} sm={12} xs={24}>
                <Skeleton avatar={{ size: 55 }} paragraph={{ rows: 1, width: '50%' }} active />
              </Col>
            ))}
          </Row>
        )}
        {!isLoadingMembers && (
          <Row gutter={40}>
            {teamStore.members.map((user, index) => (
              <Col key={index} span={8} xl={8} lg={12} md={12} sm={12} xs={24}>
                <MemberCard
                  user={user}
                  initialState={initialState}
                  defaultTeam={currentTeam.defaultTeam}
                  key={index}
                />
              </Col>
            ))}
          </Row>
        )}
        {paginate.totalDocs > 6 && !isLoadingMembers && (
          <div className="pagination-illumidesk">
            <p>
              Showing{' '}
              {paginate.pagingCounter !== 1 ? paginate.pagingCounter - 1 : paginate.pagingCounter}{' '}
              to{' '}
              {paginate.pagingCounter - 1 + paginate.limit > paginate.totalDocs
                ? paginate.totalDocs
                : paginate.pagingCounter - 1 + paginate.limit}{' '}
              of {paginate.totalDocs} results
            </p>
            <Pagination
              pageSize={pageSize}
              current={paginate.page}
              total={paginate.totalDocs}
              onChange={handlePagination}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps = withAuth(null, { dontRedirect: true });

export default withRouter<TeamPageProps>(inject('store', 'teamStore')(observer(ViewTeam)));
