import * as React from 'react';
import {
  Button,
  Input,
  Form,
  Typography,
  Row,
  Col,
  Steps,
  Switch,
  Select,
  Tag,
  Breadcrumb,
  Tooltip,
} from 'antd';
import { inject, observer } from 'mobx-react';
import * as ProjectNameGenerator from 'project-name-generator';
import { SearchOutlined } from '@ant-design/icons';
import Head from 'next/head';
import Router, { withRouter } from 'next/router';
import Layout from '../../components/layout';
import notify from '../../lib/notifier';
import { withAuth } from '../../lib/auth';
import { COMMON_ENTITY, OIDC_AUTH_NAME } from '../../lib/consts';
import { actionOnStack, validateStack } from 'lib/api/stacks';
import Link from 'next/link';
import '../../styles/Layout.module.less';
import '../../styles/Stacks.module.less';
import '../../styles/Profile.module.less';
import { TabInterface } from 'interfaces';
import {
  AuthDetailInterface,
  NewProjectState,
  NewProjectProps,
} from 'interfaces/projectsInterface';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';
import { capitalize } from 'lodash';

const { Title } = Typography;
const { Option } = Select;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const LtiButton = (props: TabInterface) => (
  <Button className={props.default} type="primary" onClick={props.onClick}>
    {props.text}
  </Button>
);

class NewStack extends React.Component<NewProjectProps, NewProjectState> {
  constructor(props: NewProjectProps) {
    super(props);
    const prefillName = ProjectNameGenerator({ number: true }).dashed;
    const { store, router } = props;
    this.state = {
      currentStep: 0,
      selectOpen: false,
      name: prefillName,
      subDomain: prefillName,
      stage: '',
      defaultAuth: 'generic',
      teams: [],
      disabled: false,
      errors: {},
      authDetail: {},
      newStackId: null,
    };

    if (!store.currentTeam) {
      store.setCurrentTeam(router.query.organizationSlug);
    }
  }

  async componentDidMount() {
    const { store } = this.props;
    const { teamStore, teams } = store;
    const { getOrganizationTeams } = teamStore;
    await getOrganizationTeams();
    this.setState({ teams: [teams[0].name] });
  }

  // This function handles form submission of first step
  public onSubmitStep1 = async (data: {}) => {
    try {
      // Constants
      const { store } = this.props;
      const { currentUser, currentOrganization, teams } = store;

      // Business Logic
      this.setState({ disabled: true });
      const validation = await validateStack({
        ...data,
        organizationId: currentOrganization._id,
        userId: currentUser._id,
      });
      if (validation.error) {
        this.setState({ errors: validation.error.errors });
      } else {
        this.setState({
          currentStep: teams.length === 1 && this.state.defaultAuth === 'generic' ? 3 : 1,
          teams: [teams[0].name],
        });
      }
    } catch (error) {
      console.log(error);
      notify(error, 'error');
    } finally {
      this.setState({ disabled: false });
    }
  };

  // This function handles form submission of auth details if not simple auth
  public onSubmitStep2 = async (values: AuthDetailInterface) => {
    try {
      // Constants
      const { store } = this.props;
      const { currentUser, currentOrganization, teams } = store;

      // Business Logic
      this.setState({ disabled: true });
      const validation = await validateStack({
        ...values,
        organizationId: currentOrganization._id,
        userId: currentUser._id,
      });
      if (validation.error) {
        this.setState({ errors: validation.error.errors });
      } else {
        this.setState({
          currentStep: teams.length === 1 ? 3 : 2,
          authDetail: values,
          teams: [teams[0].name],
        });
      }
    } catch (error) {
      notify(error, 'error');
    } finally {
      this.setState({ disabled: false });
    }
  };

  // This function sends request to server to create project
  public onSubmitLtiDetails = async () => {
    try {
      // Constants
      const { store } = this.props;
      const { currentUser, teams, stackStore } = store;
      const { addStack } = stackStore;
      const organization = store.currentOrganization;
      const teamIds = [];

      // Business Logic
      this.setState({ disabled: true });
      this.state.teams.forEach((stateTeam) => {
        const team = teams.filter((team) => team.name === stateTeam);
        if (team) {
          teamIds.push(team[0]._id);
        }
      });
      const payload = {
        teams: teamIds,
        organizationId: organization._id,
        name: this.state.name,
        stage: this.state.stage,
        subDomain: this.state.subDomain,
        namespace: this.state.subDomain,
        userId: currentUser._id,
        defaultAuth: this.state.defaultAuth,
      };
      if (Object.entries(this.state.authDetail).length !== 0) {
        payload[this.state.defaultAuth] = this.state.authDetail;
      }
      const response = await addStack(payload);
      if (response.status === 200) {
        try {
          await actionOnStack(response.project._id, 'deploy');
          notify(`${capitalize(COMMON_ENTITY)} created successfully!`, 'success');
        } catch (error) {
          console.log(error);
        }
        this.setState({ newStackId: response.project._id });
        this.goToProject();
      } else {
        notify(response.message, 'error');
      }
    } catch (error) {
      console.log(error);
      notify(`Unable to create ${COMMON_ENTITY}!`, 'error');
    } finally {
      this.setState({ disabled: false });
    }
  };

  // This function moves stepper to next step on selecting teams
  public onSubmitTeams = async () => {
    this.setState({
      currentStep: 3,
    });
  };

  // This function handles multiple team select change
  public handleTeamChange = (e: string[]) => {
    this.setState({
      teams: e,
    });
  };

  // This function redirects to project after project is created successfully
  public goToProject() {
    const { store } = this.props;
    const { newStackId } = this.state;
    const organization = store.currentOrganization;
    Router.push(`/${organization.slug}/${Pluralize(COMMON_ENTITY)}/${newStackId}`);
  }

  // This function renders all forms with a depending on stepper value
  public renderForm() {
    // Constants
    const { store } = this.props;
    const { teams } = store;
    const { defaultAuth, currentStep, errors } = this.state;
    const organization = store.currentOrganization;

    // Business Logic

    if (currentStep === 0) {
      return (
        <div className="new-stack-form">
          <Form {...layout} name="stack" initialValues={this.state} onFinish={this.onSubmitStep1}>
            <div className="stacks-form">
              <div className="heading-label-form">
                <Title level={5}>Add your {capitalize(COMMON_ENTITY)} Details</Title>
                <p>Please add your {COMMON_ENTITY} details to move to the next step.</p>
              </div>

              <Form.Item
                label={`${capitalize(COMMON_ENTITY)} Name`}
                validateStatus={errors['name'] ? 'error' : undefined}
                help={errors['name'] ? errors['name'].message : undefined}
                rules={[{ required: true, message: `Please input your ${COMMON_ENTITY} name!` }]}
              >
                <Input
                  required={true}
                  value={this.state.name}
                  onChange={(event) => {
                    if (event.target.value.length <= 50) {
                      this.setState({ name: event.target.value });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Domain"
                validateStatus={errors['subDomain'] ? 'error' : undefined}
                help={errors['subDomain'] ? errors['subDomain'].message : undefined}
                rules={[{ required: true, message: 'Please input your sub-domain!' }]}
              >
                <Input
                  required={true}
                  value={this.state.subDomain}
                  addonBefore="https://"
                  addonAfter=".illumidesk.com"
                  onChange={(event) => {
                    if (event.target.value.length <= 27) {
                      this.setState({ subDomain: event.target.value });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item
                label="Stage"
                validateStatus={errors['stage'] ? 'error' : undefined}
                help={errors['stage'] ? errors['stage'].message : undefined}
              >
                <Input
                  value={this.state.stage}
                  maxLength={50}
                  onChange={(event) => {
                    this.setState({ stage: event.target.value });
                  }}
                />
              </Form.Item>

              <div className="d-flex form-control enable-auth">
                <label>Enable {OIDC_AUTH_NAME}</label>

                <div className="right-grid">
                  <Switch
                    checked={this.state.defaultAuth === 'generic' ? true : false}
                    onChange={(checked) =>
                      this.setState({
                        defaultAuth: checked ? 'generic' : 'lti11',
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-footer">
              <div className="footer-flex">
                <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                  <Button type="text" className="btn-transparent ant-btn-margin" htmlType="submit">
                    Cancel
                  </Button>
                </Link>

                <div className="footer-flex">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="ant-btn-margin btn-primary"
                    disabled={currentStep === 0 ? true : false}
                  >
                    Previous
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="btn-primary"
                    disabled={this.state.disabled}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      );
    }
    if (currentStep === 1 && this.state.defaultAuth !== 'generic') {
      return (
        <div className="new-stack-form">
          <div className="stacks-form stacks-version">
            <div className="heading-label-form">
              <Title level={5}>Add your Version Details</Title>
              <p>Which LTI version do you want to proceed with</p>
            </div>
            <div className="stack-tabs">
              <LtiButton
                text="LTI (v1.1)"
                default={this.state.defaultAuth === 'lti11' ? 'ant-btn-active' : ''}
                onClick={() => this.setState({ defaultAuth: 'lti11', authDetail: {} })}
              />
              <LtiButton
                text="LTI (v1.3)"
                default={this.state.defaultAuth === 'lti13' ? 'ant-btn-active' : ''}
                onClick={() => this.setState({ defaultAuth: 'lti13', authDetail: {} })}
              />
            </div>
            <div className="tabs-content">
              <div>
                {currentStep === 1 && defaultAuth === 'lti11' ? (
                  <div>
                    <Form
                      {...layout}
                      name="lti11"
                      onFinish={this.onSubmitStep2}
                      initialValues={this.state.authDetail}
                    >
                      <div className="stacks-form stacks-form-inner">
                        <Form.Item
                          label="Consumer Key"
                          name="consumerKey"
                          validateStatus={errors['lti11.consumerKey'] ? 'error' : undefined}
                          help={
                            errors['lti11.consumerKey']
                              ? errors['lti11.consumerKey'].message
                              : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input your consumer key!',
                            },
                          ]}
                        >
                          <Input required={true} maxLength={256} />
                        </Form.Item>
                        <Form.Item
                          label="Shared Secret"
                          name="sharedSecret"
                          validateStatus={errors['lti11.sharedSecret'] ? 'error' : undefined}
                          help={
                            errors['lti11.sharedSecret']
                              ? errors['lti11.sharedSecret'].message
                              : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input your shared secret!',
                            },
                          ]}
                        >
                          <Input required={true} />
                        </Form.Item>
                      </div>

                      <div className="form-footer">
                        <div className="footer-flex">
                          <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                            <Button type="text" className="btn-transparent">
                              Cancel
                            </Button>
                          </Link>

                          <div className="footer-flex">
                            <Button
                              type="primary"
                              className="ant-btn-margin btn-primary"
                              onClick={() => this.setState({ currentStep: 0 })}
                              disabled={currentStep === 1 ? false : true}
                            >
                              Previous
                            </Button>
                            <Button
                              type="primary"
                              htmlType="submit"
                              className="btn-primary"
                              disabled={this.state.disabled}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Form>
                  </div>
                ) : (
                  <div className="new-stack-form">
                    <Form
                      {...layout}
                      name="lti13"
                      onFinish={this.onSubmitStep2}
                      initialValues={this.state.authDetail}
                    >
                      <div className="stacks-form stacks-form-inner">
                        <Form.Item
                          label="Client ID"
                          name="clientId"
                          validateStatus={errors['lti13.clientId'] ? 'error' : undefined}
                          help={
                            errors['lti13.clientId'] ? errors['lti13.clientId'].message : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input your client ID!',
                            },
                          ]}
                        >
                          <Input required={true} />
                        </Form.Item>
                        <Form.Item
                          label="Redirect URL"
                          name="redirectUrl"
                          validateStatus={errors['lti13.redirectUrl'] ? 'error' : undefined}
                          help={
                            errors['lti13.redirectUrl']
                              ? errors['lti13.redirectUrl'].message
                              : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input your redirect url!',
                            },
                          ]}
                        >
                          <Input required={true} />
                        </Form.Item>
                        <Form.Item
                          label="Token URL"
                          name="tokenUrl"
                          validateStatus={errors['lti13.tokenUrl'] ? 'error' : undefined}
                          help={
                            errors['lti13.tokenUrl'] ? errors['lti13.tokenUrl'].message : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input your token url!',
                            },
                          ]}
                        >
                          <Input required={true} />
                        </Form.Item>
                        <Form.Item
                          label="Authorization URL"
                          name="authorizationUrl"
                          validateStatus={errors['lti13.authorizationUrl'] ? 'error' : undefined}
                          help={
                            errors['lti13.authorizationUrl']
                              ? errors['lti13.authorizationUrl'].message
                              : undefined
                          }
                          rules={[
                            {
                              required: true,
                              message: 'Please input your authorization url!',
                            },
                          ]}
                        >
                          <Input required={true} />
                        </Form.Item>
                      </div>

                      <div className="form-footer">
                        <div className="footer-flex">
                          <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                            <Button type="text" className="btn-transparent">
                              Cancel
                            </Button>
                          </Link>

                          <div className="footer-flex">
                            <Button
                              type="primary"
                              className="ant-btn-margin btn-primary"
                              onClick={() => this.setState({ currentStep: 0 })}
                              disabled={currentStep === 1 ? false : true}
                            >
                              Previous
                            </Button>
                            <Button
                              type="primary"
                              className="btn-primary"
                              htmlType="submit"
                              disabled={this.state.disabled}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (
      (currentStep === 1 && this.state.defaultAuth === 'generic') ||
      (currentStep === 2 && this.state.defaultAuth !== 'generic')
    ) {
      return (
        <div className="new-stack-form">
          <Form {...layout} name="stack" onFinish={this.onSubmitTeams}>
            <div className="stacks-form">
              <div className="heading-label-form">
                <Title level={5}>Add Multiple Teams</Title>
                <p>You can add multiple teams to one {COMMON_ENTITY}.</p>
              </div>
              <Title level={5}> Teams </Title>
              <Form.Item>
                <Select
                  className="add-multiple-team"
                  mode="multiple"
                  onChange={this.handleTeamChange}
                  placeholder={
                    <>
                      <SearchOutlined /> Search Teams
                    </>
                  }
                  style={{ width: '100%' }}
                >
                  {teams.map((team) => (
                    <Option value={team.name} key={team._id}>
                      {team.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="form-footer">
              <div className="footer-flex">
                <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                  <Button type="text" className="btn-transparent">
                    Cancel
                  </Button>
                </Link>
                <div className="footer-flex">
                  <Button
                    type="primary"
                    className="ant-btn-margin btn-primary"
                    onClick={() => {
                      this.state.currentStep === 1
                        ? this.setState({ currentStep: 0 })
                        : this.setState({ currentStep: 1 });
                    }}
                    disabled={currentStep === 1 || 2 ? false : true}
                  >
                    Previous
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="btn-primary"
                    disabled={this.state.teams.length === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      );
    }

    if (currentStep === 3) {
      // Business Logic
      return (
        <div className="new-stack-form">
          <Form
            {...layout}
            name="stack"
            initialValues={this.state}
            onFinish={this.onSubmitLtiDetails}
          >
            <div className="stacks-form stacks-view-form">
              <div className="heading-label-form">
                <Title level={5}>Review your {capitalize(COMMON_ENTITY)} Details</Title>
                <p>Please verify your details before you deploy your {COMMON_ENTITY}</p>
              </div>

              <div className="d-flex form-control">
                <label>{capitalize(COMMON_ENTITY)} name</label>

                <div className="right-grid">
                  <label>{this.state.name}</label>
                </div>
              </div>

              <div className="d-flex form-control">
                <label>Domain</label>

                <div className="right-grid">
                  <label>{`https://${this.state.subDomain}.illumidesk.com/`}</label>
                </div>
              </div>

              <div className="d-flex form-control">
                <label>Stage</label>

                <div className="right-grid">
                  <label>{this.state.stage}</label>
                </div>
              </div>

              {this.state.defaultAuth === 'lti13' && (
                <div className="d-flex form-control">
                  <label>Authorization URL</label>

                  <div className="right-grid">
                    <label>{this.state.authDetail.authorizationUrl}</label>
                  </div>
                </div>
              )}

              {this.state.defaultAuth === 'generic' && (
                <div className="d-flex form-control">
                  <label>Auth Selected</label>

                  <div className="right-grid">
                    <label>Simple Auth</label>
                  </div>
                </div>
              )}

              {this.state.defaultAuth === 'lti11' && (
                <>
                  <div className="d-flex form-control">
                    <label>Consumer Key</label>

                    <div className="right-grid">
                      <label>{this.state.authDetail.consumerKey}</label>
                    </div>
                  </div>

                  <div className="d-flex form-control">
                    <label>Shared Key</label>

                    <div className="right-grid">
                      <label>{this.state.authDetail.sharedSecret}</label>
                    </div>
                  </div>
                </>
              )}
              <div className="d-flex form-control">
                <label>Teams</label>

                <div className="right-grid">
                  {this.state.teams.map((team, index) => (
                    <Tooltip key={index} title={team}>
                      <Tag key={index}>{team} </Tag>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-footer">
              <div className="footer-flex">
                <Link href={`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                  <Button type="text" className="btn-transparent">
                    Cancel
                  </Button>
                </Link>

                <div className="footer-flex">
                  <Button
                    type="primary"
                    className="ant-btn-margin btn-primary"
                    onClick={() => {
                      this.setState({
                        currentStep:
                          this.state.defaultAuth === 'generic'
                            ? teams.length === 1
                              ? 0
                              : 1
                            : teams.length === 1
                            ? 1
                            : 2,
                        teams: [teams[0].name],
                      });
                    }}
                    disabled={currentStep === 3 ? false : true}
                  >
                    Previous
                  </Button>

                  <Button
                    type="primary"
                    htmlType="submit"
                    className="btn-primary"
                    disabled={this.state.disabled}
                    loading={this.state.disabled}
                  >
                    Deploy
                  </Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      );
    }
    return null;
  }

  public render() {
    // Constants
    const { currentOrganization, teams } = this.props.store;

    // Business Logic
    return (
      <Layout {...this.props}>
        <Head>
          <title>New {capitalize(COMMON_ENTITY)}</title>
          <meta name="description" content={`Create a new ${capitalize(COMMON_ENTITY)}`} />
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
            <a>
              <span className="breadcrumb__inner">Create a New {capitalize(COMMON_ENTITY)}</span>
            </a>
          </Breadcrumb.Item>
        </Breadcrumb>

        {currentOrganization.isTransferred && <OrganizationNotification />}
        <div className="main-wrapper">
          <div className="page-header-stacks">
            <h4>Create a New {capitalize(COMMON_ENTITY)}</h4>
          </div>

          <Row gutter={16}>
            <Col span={5} xl={5} lg={24} md={24} sm={24} xs={24} className="steps-shape">
              <Steps size="small" current={this.state.currentStep.valueOf()} direction="vertical">
                <Steps.Step title={`${capitalize(COMMON_ENTITY)} Details`} />
                {this.state.defaultAuth !== 'generic' && <Steps.Step title="Add Version Details" />}
                {teams.length > 1 && <Steps.Step title="Add Multiple Teams" />}
                <Steps.Step title="Preview" />
              </Steps>
            </Col>

            <Col span={19} xl={17} lg={24} md={24} sm={24} xs={24}>
              <div>{this.renderForm()}</div>
            </Col>
          </Row>
        </div>
      </Layout>
    );
  }
}

export const getServerSideProps = withAuth(null, { dontRedirect: true });

export default withRouter<NewProjectProps>(inject('store')(observer(NewStack)));
