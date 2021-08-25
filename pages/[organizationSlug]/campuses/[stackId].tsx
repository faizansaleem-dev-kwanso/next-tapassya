import * as React from 'react';
import router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Modal,
  Breadcrumb,
  Col,
  Row,
  Badge,
  Typography,
  Tag,
} from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../../components/layout';
import { getStatusAndComment } from '../../../lib/stackStatus';
import { withAuth } from '../../../lib/auth';
import { actionOnStack, deleteStack } from '../../../lib/api/stacks';
import notify from '../../../lib/notifier';
import { COMMON_ENTITY, OIDC_AUTH_NAME } from '../../../lib/consts';
import { createStripePortalSession } from 'lib/api/team-leader';
import '../../../styles/Stacks.module.less';
import StacksModal from '../../../components/common/StacksModal';
import { StackIdProps, StackIdState } from 'interfaces';
import { ProjectUpdateInterface } from 'interfaces/projectsInterface';
import OrganizationNotification from 'components/common/OrganizationNotification';
import { capitalize } from 'lodash';
import Pluralize from 'pluralize';

const { Option } = Select;

const { Title } = Typography;
class StacksID extends React.Component<StackIdProps, StackIdState> {
  state = {
    disabled: false,
    loading: true,
    stack: null,
    defaultAuth: null,
    isShowModalStop: false,
    isShowModalDelete: false,
    isShowModalDeploy: false,
    isDeploying: false,
    errors: {},
  };

  // This function updates project
  public update = async (data: ProjectUpdateInterface) => {
    try {
      const { router, store, stackStore } = this.props;

      const organization = store.currentOrganization;
      data.organizationId = organization._id;
      const res = await stackStore.updateStack({
        stackId: router.query.stackId,
        data: { ...data },
      });
      if (res.status === 200) {
        this.setState({
          stack: res.project,
          defaultAuth: res.project.defaultAuth,
        });
        notify(res.message, 'success');
        router.push(`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`);
      } else {
        notify(res.message, 'error');
      }
    } catch (error) {
      notify(error, 'error');
    }
  };

  // stop Modal

  showModalStop = () => {
    this.setState({ isShowModalStop: true });
  };

  closeModalStop = () => {
    this.setState({ isShowModalStop: false });
  };

  // delete Modal

  showModalDelete = () => {
    this.setState({ isShowModalDelete: true });
  };

  closeModalDelete = () => {
    this.setState({ isShowModalDelete: false });
  };

  // delete Modal

  showModalDeploy = () => {
    this.setState({ isShowModalDeploy: true });
  };

  closeModalDeploy = () => {
    this.setState({ isShowModalDeploy: false });
  };

  // This function deletes project
  public delete = async () => {
    try {
      this.setState({ disabled: true });
      const { router, store } = this.props;
      const organization = store.currentOrganization;
      const response = await deleteStack(router.query.stackId);
      if (response.status === 200) {
        notify(`${capitalize(COMMON_ENTITY)} deleted`, 'success');
        router.push(`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`);
      } else {
        notify(response.message, 'error');
      }
    } catch (error) {
      console.log('error', error);
      Modal.error({
        title: 'Error!',
        content: (
          <div>
            <p>Unable to delete {COMMON_ENTITY}</p>
          </div>
        ),
        okText: 'Ok',
      });
    } finally {
      this.setState({ disabled: false });
    }
  };

  // This function checks the plan to deploy project
  public changePlanToDeploy = async () => {
    const { store } = this.props;
    const organization = store.currentOrganization;
    try {
      const response = await createStripePortalSession(
        organization._id,
        window.location.href,
        true,
      );
      window.location.href = response.url;
    } catch (error) {
      notify(error, 'error');
    }
  };

  // This function deploys the project
  public deploy = async () => {
    try {
      this.setState({ disabled: true, isDeploying: true });
      const { router } = this.props;
      const res = await actionOnStack(router.query.id, 'deploy');
      if (res.error) {
        this.setState({ isDeploying: false });
        const errorProps = {};
        if (res.errorCode === 'STRIPE_PLAN_CHANGE') {
          errorProps['okText'] = 'Change Plan';
          errorProps['onOk'] = () => {
            notify('Redirecting to Stripe...', 'success');
            this.changePlanToDeploy();
          };
        }
        Modal.error({
          title: 'Error!',
          content: (
            <div>
              <p>{res.error}</p>
            </div>
          ),
          okText: 'Ok',
          closable: true,
          maskClosable: true,
          ...errorProps,
        });
      } else {
        this.setState({ stack: res.data, isDeploying: false });
        Modal.info({
          title: `Your ${COMMON_ENTITY} environment is being deployed`,
          content: (
            <div>
              <p>
                You may continue to work on other items and will be notified once your Project’s
                cluster is available.
                <b>{res.trialStarted && ' We have started your 2 week trial from today'}</b>
              </p>
            </div>
          ),
          okText: 'Done',
        });
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  // This function stops the running project
  public stop = async () => {
    try {
      this.setState({ disabled: true });
      const { router } = this.props;
      const res = await actionOnStack(router.query.stackId, 'stop');
      if (res.error) {
        Modal.error({
          title: 'Error!',
          content: (
            <div>
              <p>{res.error}</p>
            </div>
          ),
          okText: 'Ok',
        });
      } else {
        this.setState({ stack: res.data });
        Modal.info({
          title: `Your ${COMMON_ENTITY} will be stopped soon`,
          content: (
            <div>
              <p>
                You may continue to work on other items and will be notified once your{' '}
                {COMMON_ENTITY}
                cluster is down.
              </p>
            </div>
          ),
          okText: 'Done',
        });
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      this.setState({ disabled: false });
    }
  };

  // This function gets all projects from database after component is mounted
  public async componentDidMount() {
    const { router, stackStore } = this.props;
    const { getStackById } = stackStore;
    const response = await getStackById(router.query.stackId);
    if (response.status === 200) {
      const stack = response.project;
      this.setState({ stack, defaultAuth: stack.defaultAuth, loading: false });
    } else {
      notify(response.message, 'error');
    }
  }

  // This function renders project Auth Form
  public renderAuthForm() {
    const { defaultAuth } = this.state;
    if (defaultAuth === 'lti13') {
      return (
        <>
          <Form.Item
            label="Client ID"
            name={['lti13', 'clientId']}
            rules={[{ required: true, message: 'Please input your client id!' }]}
          >
            <Input required={true} />
          </Form.Item>
          <Form.Item
            label="Redirect URL"
            name={['lti13', 'redirectUrl']}
            rules={[{ required: true, message: 'Please input your redirect url!' }]}
          >
            <Input required={true} />
          </Form.Item>
          <Form.Item
            label="Token URL"
            name={['lti13', 'tokenUrl']}
            rules={[{ required: true, message: 'Please input your token url!' }]}
          >
            <Input required={true} />
          </Form.Item>
          <Form.Item
            label="Authorization URL"
            name={['lti13', 'authorizationUrl']}
            rules={[
              {
                required: true,
                message: 'Please input your authorization url!',
              },
            ]}
          >
            <Input required={true} />
          </Form.Item>
        </>
      );
    }
    if (defaultAuth === 'lti11') {
      return (
        <>
          <Form.Item
            label="Consumer Key"
            name={['lti11', 'consumerKey']}
            rules={[{ required: true, message: 'Please input your consumer key!' }]}
          >
            <Input required={true} />
          </Form.Item>
          <Form.Item
            label="Shared Secret"
            name={['lti11', 'sharedSecret']}
            rules={[{ required: true, message: 'Please input your shared secret!' }]}
          >
            <Input required={true} />
          </Form.Item>
        </>
      );
    }
    return null;
  }

  // This function renders settings for projects
  public renderSettings() {
    const { store } = this.props;
    const organization = store.currentOrganization;
    const { stack, errors } = this.state;
    const { actions } = stack;
    const { text, unProvisionedAction, className, classNameDot, comment } =
      getStatusAndComment(actions);

    const disableButtons = this.state.disabled || unProvisionedAction !== null;

    return (
      <div>
        <Row gutter={16}>
          <Col span={17} xl={17} lg={24} md={24} sm={24} xs={24}>
            <Form name="stack" initialValues={stack} onFinish={this.update}>
              <div className="stacks-form">
                <Form.Item
                  label={`${capitalize(COMMON_ENTITY)} Name`}
                  name="name"
                  validateStatus={errors['name'] ? 'error' : undefined}
                  help={errors['name'] ? errors['name'].message : undefined}
                  rules={[
                    {
                      required: true,
                      message: `Please input your ${COMMON_ENTITY} name!`,
                    },
                  ]}
                >
                  <Input required={true} maxLength={128} />
                </Form.Item>

                <Form.Item
                  label="Domain"
                  name="subDomain"
                  validateStatus={errors['subDomain'] ? 'error' : undefined}
                  help={errors['subDomain'] ? errors['subDomain'].message : undefined}
                  rules={[
                    {
                      required: true,
                      message: 'Please input your sub-domain!',
                    },
                  ]}
                >
                  <Input
                    required={true}
                    addonBefore="https://"
                    addonAfter=".illumidesk.com"
                    disabled={true}
                  />
                </Form.Item>

                <Form.Item
                  label="Stage"
                  name="stage"
                  validateStatus={errors['stage'] ? 'error' : undefined}
                  help={errors['stage'] ? errors['stage'].message : undefined}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Teams">
                  <div>
                    {this.state.stack.teams.map((team, index) => (
                      <Tag key={index}>{team.name} </Tag>
                    ))}
                  </div>
                </Form.Item>

                <Form.Item
                  label="Authorization URL"
                  name="defaultAuth"
                  validateStatus={errors['defaultAuth'] ? 'error' : undefined}
                  help={errors['defaultAuth'] ? errors['defaultAuth'].message : undefined}
                  rules={[
                    {
                      required: true,
                      message: 'Please input your redirect url!',
                    },
                  ]}
                >
                  <Select
                    onChange={(defaultAuth) =>
                      this.setState({
                        defaultAuth: String(defaultAuth),
                      })
                    }
                  >
                    <Option value="generic">{OIDC_AUTH_NAME}</Option>
                    <Option value="lti11">LTI v1.1</Option>
                    <Option value="lti13">LTI v1.3</Option>
                  </Select>
                </Form.Item>

                {this.renderAuthForm()}
              </div>

              <div className="form-footer">
                <Form.Item>
                  <Button
                    type="primary"
                    disabled={text === 'Stopped' ? false : true}
                    loading={this.state.isDeploying}
                    className="ant-btn-margin"
                    onClick={() => this.showModalDeploy()}
                  >
                    Deploy
                  </Button>

                  <StacksModal
                    isShowModal={this.state.isShowModalDeploy}
                    close={this.closeModalDeploy}
                    action={this.deploy}
                    title={`Are you sure you want to deploy this ${COMMON_ENTITY} with current settings?`}
                    subTitle=""
                    buttonText="Deploy"
                  />
                  <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                    <Button type="primary" className="btn-outlined ant-btn-margin">
                      Cancel
                    </Button>
                  </Link>

                  <Button type="primary" htmlType="submit" disabled={disableButtons}>
                    Update
                  </Button>
                </Form.Item>
              </div>
            </Form>

            <br />

            <Card className="stacks-card-services">
              <div className="d-flex">
                <div className="d-flex-content">
                  <h5>Stop! Interactive learning Environment</h5>
                  <p>
                    Are you sure you want to stop your {COMMON_ENTITY} interactive learning
                    Environment? All of your data access will be lost.
                  </p>
                </div>
                <Button
                  type="primary"
                  className="stop-service-button"
                  disabled={text === 'Running' ? false : true}
                  onClick={() => this.showModalStop()}
                >
                  Stop Service
                </Button>
              </div>

              <StacksModal
                isShowModal={this.state.isShowModalStop}
                close={this.closeModalStop}
                action={this.stop}
                title={`Are you Sure you want to Stop ${capitalize(COMMON_ENTITY)}?`}
                subTitle={`Are you sure you want to stop your ${COMMON_ENTITY}? All of your running services will be stop. This action can't be undone.`}
                buttonText="Stop"
              />
            </Card>

            <Card className="stacks-card-services stack-danger-zone">
              <div className="d-flex">
                <div>
                  <div className="d-flex-chart">
                    <div className="caution-grid">
                      <img src="/Danger-icon.svg" />
                    </div>
                    <Title level={5} type="danger">
                      Danger Zone
                    </Title>
                  </div>

                  <div className="d-flex-content">
                    <h5>Delete {capitalize(COMMON_ENTITY)}</h5>
                    <p>
                      Are you sure you want to delete your {COMMON_ENTITY}? All of your data will be
                      lost permanently. This action can not be undone.
                    </p>
                  </div>
                </div>

                <Button
                  className="delete-stack-button"
                  type="primary"
                  disabled={text === 'Running' || text === 'Stopped' ? false : true}
                  onClick={() => this.showModalDelete()}
                >
                  Delete {capitalize(COMMON_ENTITY)}
                </Button>
              </div>

              <StacksModal
                isShowModal={this.state.isShowModalDelete}
                name={stack.name}
                action={this.delete}
                close={this.closeModalDelete}
                title={`Are you Sure you want to Delete ${capitalize(COMMON_ENTITY)}?`}
                subTitle={`Please type "${stack.name}" to confirm`}
                buttonText="Delete"
              />
            </Card>
          </Col>

          <Col span={7} xl={7} lg={24} md={24} sm={24} xs={24}>
            <Card className="stacks-card-services">
              <div className="stacks-form status-card">
                <label>Status</label>
                <Badge className={className}>
                  <div className={classNameDot}></div>
                  {comment === 'De-provisioning' ? 'De-provisioning' : text}
                </Badge>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  public render() {
    const { loading, stack } = this.state;
    const { store } = this.props;
    const { currentUser } = store;
    const organization = store.currentOrganization;

    if (!currentUser || loading) {
      return null;
    }

    return (
      <Layout {...this.props}>
        <Head>
          <title>{capitalize(COMMON_ENTITY)} Details</title>
          <meta name="description" content={`${capitalize(COMMON_ENTITY)} Details`} />
        </Head>
        {organization.isTransferred && <OrganizationNotification />}
        <Breadcrumb className="breadcrumb">
          <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
            <a>
              <span className="breadcrumb__inner">
                <img src="/home.svg" alt="home" />
              </span>
            </a>
          </Link>
          <a>
            <span className="breadcrumb__inner">{stack.name}</span>
          </a>
        </Breadcrumb>

        <div className="previous-screen">
          <a onClick={() => router.back()}>
            <img src="/chevron-gray.svg" alt="back" /> Back
          </a>
        </div>

        <div className="form-wrapper">
          <div className="page-header-stacks">
            <h4>{stack.name}</h4>
          </div>
          {this.renderSettings()}
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps = withAuth(null, {});

export default withRouter<StackIdProps>(inject('store', 'stackStore')(observer(StacksID)));
