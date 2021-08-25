/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/layout/index';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { withAuth } from '../lib/auth';
import Head from 'next/head';
import { TeamPageProps } from '../interfaces/index';
import {
  Row,
  Col,
  Card,
  Collapse,
  Form,
  Input,
  Button,
  Skeleton,
  Typography,
  Breadcrumb,
} from 'antd';
import { COMMON_ENTITY, FormRules } from 'lib/consts';
import TransferModal from '../components/common/transferAccountModal';
import '../styles/Settings.module.less';
import StripeCard from 'components/common/StripeCard';
import DeleteOrganizationModal from '../components/organization/deleteOrganizationModal';
import notify from 'lib/notifier';
import { getOrganizationCardDetails, isOrgTransfered } from 'lib/api/organization';
import { CardInterface } from 'interfaces/organizationInterfaces';
import { createStripePortalSession } from 'lib/api/team-leader';
import { isUserAdmin } from 'lib/api/role';
import { InviteInterface } from 'interfaces/inviteInterfaces';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';

const { Panel } = Collapse;
const { Title } = Typography;

/**
 * This page renders organization settings
 * @param props
 * @returns
 */
const OrganizationSettings: React.FC<TeamPageProps> = (props): JSX.Element => {
  // Constants
  const { store } = props;
  const { currentOrganization, organizationStore, currentUser } = store;
  const { editOrganization, abortTransferOrganization } = organizationStore;
  const plan = currentOrganization.billingId.planName;

  // States
  const [card, setCard] = useState<CardInterface>();
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isInstructor, setIsInstructor] = useState<boolean>(false);
  const [isTransferred, setIsTransferred] = useState<boolean>(false);
  const [transferInviation, setTransferInvitation] = useState<Partial<InviteInterface>>({});

  // Functions and Side Effects
  /**
   * This function sends request to edit organization
   * @param formValues
   */
  const handleSubmit = async (formValues: { organizationName: string }): Promise<void> => {
    const response = await editOrganization({
      name: formValues.organizationName,
      organizationId: currentOrganization._id,
    });
    if (response.status === 200) {
      notify(response.message, 'success');
    } else {
      notify(response.message, 'error');
    }
  };

  // This function checks if current organization is transfered or not
  const checkTransfer = async (): Promise<void> => {
    const response = await isOrgTransfered(currentOrganization._id);
    if (response.status === 200) {
      setIsTransferred(response.found);
      setTransferInvitation(response.invitation);
    } else {
      setIsTransferred(false);
    }
  };

  // This function aborts or deletes transfer organization invite
  const handleAbortInvitation = async (): Promise<void> => {
    const response = await abortTransferOrganization(transferInviation._id);
    if (response.status === 200) {
      setIsTransferred(false);
      notify(response.message, 'success');
    } else {
      notify(response.message, 'error');
    }
  };

  // This functions checks user role
  const checkRole = async () => {
    const response = await isUserAdmin();
    if (response.status === 200) {
      setIsAdmin(response.isAdmin);
      setIsInstructor(response.isInstructor);
    } else {
      setIsAdmin(false);
    }
  };

  /**
   * This function redirects to stripe billing screen
   */
  const goToBilling = async (): Promise<void> => {
    const response = await createStripePortalSession(
      currentOrganization.billingId,
      window.location.href,
      false,
    );
    if (response) {
      window.location.href = response.url;
    }
  };

  /**
   * This function gets user card details
   */
  const getCardDetails = async (): Promise<void> => {
    const response = await getOrganizationCardDetails();
    if (response.status === 200) {
      setCard(response.card);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRole();
  }, []);

  useEffect(() => {
    checkTransfer();
  }, [isTransferred]);

  useEffect(() => {
    if (
      (isAdmin && currentOrganization.ownerId === currentUser._id) ||
      (isInstructor && currentOrganization.ownerId === currentUser._id)
    ) {
      getCardDetails();
    }
  }, [isAdmin, isInstructor]);

  return (
    <Layout {...props}>
      <Head>
        <title>Organization Settings</title>
        <meta name="description" content="Organization Settings" />
      </Head>
      <Breadcrumb className="breadcrumb">
        <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`}>
          <a>
            <span className="breadcrumb__inner">
              <img src="/home.svg" alt="home" />
            </span>
          </a>
        </Link>
        <a>
          <span className="breadcrumb__inner">Settings</span>
        </a>
      </Breadcrumb>
      {currentOrganization.isTransferred && <OrganizationNotification />}

      <div className="main-wrapper organization-settings">
        <div className="page-header-stacks">
          <h4>Organization Settings</h4>
        </div>

        <Row gutter={40}>
          <Col span={17} xl={17} lg={24} md={24} sm={24} xs={24}>
            {((isAdmin && currentOrganization.ownerId === currentUser._id) ||
              (isInstructor && currentOrganization.ownerId === currentUser._id)) && (
              <>
                <div>
                  <Collapse accordion>
                    <Panel header="Edit Organization" key="1">
                      <Card bordered={false}>
                        <div>
                          <Form
                            onFinish={handleSubmit}
                            initialValues={{ organizationName: currentOrganization.name }}
                          >
                            <div className="form-padding">
                              <div className="heading-label-form">
                                <h4>Organization Details</h4>
                                <p>Please update organization name from here</p>
                              </div>
                              <Form.Item
                                label="Organization Name"
                                name="organizationName"
                                rules={[FormRules.organizationName]}
                              >
                                <Input maxLength={50} />
                              </Form.Item>
                            </div>
                            <div className="form-footer">
                              <Button type="primary" htmlType="submit">
                                Update Organization
                              </Button>
                            </div>
                          </Form>
                        </div>
                        <div></div>
                      </Card>
                    </Panel>
                  </Collapse>
                </div>
                {!currentOrganization.isDefaultOrganization &&
                  currentOrganization.billingId.planName !== 'Free' && (
                    <div>
                      <Collapse accordion>
                        <Panel header="Transfer Organization" key="2">
                          <Card bordered={false}>
                            <div>
                              <h5>Transfer your Organization</h5>
                              <p>
                                {isTransferred ? (
                                  <>
                                    Organization ownership invite sent at{' '}
                                    <strong>{transferInviation.email}</strong>
                                  </>
                                ) : (
                                  'You’ll lose complete access and all rights once you transfer your organization'
                                )}
                              </p>
                            </div>
                            <div>
                              {!isTransferred && (
                                <TransferModal setIsTransferred={setIsTransferred} />
                              )}
                              {isTransferred && (
                                <Button
                                  type="primary"
                                  className="btn-primary"
                                  danger
                                  onClick={handleAbortInvitation}
                                >
                                  Abort Invitation
                                </Button>
                              )}
                            </div>
                          </Card>
                        </Panel>
                      </Collapse>
                    </div>
                  )}
              </>
            )}
            <div>
              <Collapse accordion>
                <Panel header="Billing" key="3">
                  <Card bordered={false}>
                    <div>
                      <h5>Change your Card Details</h5>
                      <p>
                        If you want to add another card or remove this card click on the button
                        bellow
                      </p>
                    </div>
                    <div>
                      <Button type="primary" onClick={goToBilling}>
                        Change Card
                      </Button>
                    </div>
                  </Card>
                </Panel>
              </Collapse>
            </div>
            <div>
              <Collapse accordion>
                <Panel header="Change Plan" key="4">
                  <Card bordered={false}>
                    <div>
                      <h5>Change your Plan</h5>
                      <p>
                        Your current plan is <strong>{plan} Plan</strong> to change your plan click
                        on the button bellow
                      </p>
                    </div>
                    <div>
                      <Link href="/plans">
                        <Button type="primary">Change Plan</Button>
                      </Link>
                    </div>
                  </Card>
                </Panel>
              </Collapse>
            </div>
            {((isAdmin && currentOrganization.ownerId === currentUser._id) ||
              (isInstructor && currentOrganization.ownerId === currentUser._id)) && (
              <Card className="stacks-card-services organization-actions">
                <div className="danger-zone">
                  <div className="icon-avatar">
                    <img src="/caution.svg" alt="caution" />
                  </div>
                  <Title level={5} type="danger">
                    Danger Zone
                  </Title>
                </div>

                <h5>Delete Organization</h5>
                {currentOrganization.isDefaultOrganization ? (
                  <p>This is default organization. You cannot delete default organization</p>
                ) : (
                  <p>
                    Are you sure you want to delete organization? By deleting this you will lose all
                    your organization data.
                  </p>
                )}
                <DeleteOrganizationModal />
              </Card>
            )}
          </Col>
          {((isAdmin && currentOrganization.ownerId === currentUser._id) ||
            (isInstructor && currentOrganization.ownerId === currentUser._id)) && (
            <Col span={7} xl={7} lg={24} md={24} sm={24} xs={24}>
              <div className="billing-details">
                <div className="billing-header">
                  <h5>Billing Details</h5>
                </div>
                {loading && (
                  <Skeleton.Button
                    style={{ width: 340, height: 150, borderRadius: '20px' }}
                    active
                    size={'large'}
                  />
                )}
                {!loading && <StripeCard card={card} />}
              </div>
            </Col>
          )}
        </Row>
      </div>
    </Layout>
  );
};

export const getServerSideProps = withAuth(null, { dontRedirect: true });
export default withRouter<TeamPageProps>(inject('store')(observer(OrganizationSettings)));
