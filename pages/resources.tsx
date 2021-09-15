/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import Layout from 'components/layout';
import { ResourcesProps } from 'interfaces';
import Head from 'next/head';
import { withAuth } from 'lib/auth';
import { inject, observer } from 'mobx-react';
import { Breadcrumb } from 'antd';
import DeActivateModal from 'components/common/deActivateAccountModal';
import Link from 'next/link';
import { COMMON_ENTITY } from 'lib/consts';
import { getResources } from 'lib/api/organization';
import Pluralize from 'pluralize';
import { GetServerSideProps } from 'next';
import { ResourcesInterface } from 'interfaces/organizationInterfaces';
import ResourceCard from '../components/organization/resourceCard';

const Resources: FC<ResourcesProps> = (props): JSX.Element => {
  const [resources, setResources] = useState<ResourcesInterface[]>([]);
  const { store } = props;
  const { currentOrganization } = store;

  const fetchUserResources = async (): Promise<void> => {
    const result = await getResources();
    setResources(result.resources);
  };

  useEffect(() => {
    fetchUserResources();
  }, []);

  return (
    <Layout {...props}>
      <Head>
        <title>Resource Details</title>
        <meta name="resources" content="resources" />
      </Head>
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
          <Link href="/profile-settings">
            <a>
              <span className="breadcrumb__inner">Profile Settings</span>
            </a>
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a>
            <span className="breadcrumb__inner">Resource Details</span>
          </a>
        </Breadcrumb.Item>
      </Breadcrumb>
      <div className="main-wrapper organization-settings">
        <div className="resource-header-main">
          <div className="resource-header">
            <h4>Resource Details</h4>
            <p>
              Review your organizations, campuses and teams associated with your account before
              proceeding to deactivate account.
            </p>
          </div>

          <DeActivateModal />
        </div>

        {resources &&
          resources.map((organization, index) => (
            <ResourceCard
              key={index}
              organizationName={organization.name}
              teams={organization.teams}
              projects={organization.projects}
              plan={organization.billingId.planName}
              defaultOrg={organization.isDefaultOrganization}
              orgTransferred={organization.isTransferred}
            />
          ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(null, { dontRedirect: true });

export default inject('store')(observer(Resources));
