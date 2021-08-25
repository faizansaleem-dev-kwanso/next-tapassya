import * as React from 'react';
import { Button, Form, Input } from 'antd';
import { inject, observer } from 'mobx-react';
import Head from 'next/head';
import NProgress from 'nprogress';
import Router from 'next/router';
import notify from '../lib/notifier';
import { withAuth } from '../lib/auth';
import '../styles/Stacks.module.less';
import '../styles/Layout.module.less';
import OnboardingHeader from 'components/common/OnboardingHeader';
import { UserInfoProps, UserInfoState } from 'interfaces';
import Pluralize from 'pluralize';
import { COMMON_ENTITY, FormRules } from 'lib/consts';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * This page renders user information
 */
class UserInfo extends React.Component<UserInfoProps, UserInfoState> {
  public state = {
    newFirstName: '',
    newLastName: '',
    disabled: false,
    loading: false,
  };

  // This function handles form submission
  public onSubmit = async (values: {
    firstName: string;
    lastName: string;
    organizationName: string;
  }) => {
    const { store } = this.props;
    const { firstName, lastName, organizationName } = values;
    const { currentUser, currentOrganization } = store;
    const { setOrganizations, addOrganization } = store.organizationStore;
    const { updateProfile } = currentUser;

    if (!firstName) {
      notify('First name is required.', 'error', true);
      return;
    }

    if (!lastName) {
      notify('First name is required.', 'error', true);
      return;
    }

    NProgress.start();

    try {
      this.setState({ disabled: true });

      await updateProfile({ firstName, lastName, avatarUrl: '' });
      if (currentOrganization) {
        this.setState({ loading: true });
        const response = await addOrganization({
          name: '',
        });
        if (response.status === 200) {
          this.setState({ loading: false });
          Router.push(`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`);
          notify('Redirecting...', 'success', true);
          NProgress.done();
        }
      } else {
        this.setState({ loading: true });
        const response = await addOrganization({
          name: organizationName,
        });
        if (response.status === 200) {
          localStorage.removeItem('current');
          setOrganizations([response.organization], response.organization.slug);
          Router.push('/plans');
          this.setState({ loading: false });
          notify('Redirecting...', 'success', true);
          NProgress.done();
        } else {
          this.setState({ loading: false });
          notify(response.message, 'error', true);
        }
      }
    } catch (error) {
      NProgress.done();
      notify(error, 'error', true);
    } finally {
      this.setState({ disabled: false });
    }
  };

  public render() {
    const { store } = this.props;
    const user = store.currentUser;

    return (
      <OnboardingHeader {...this.props}>
        <Head>
          <title>User Information</title>
          <meta name="description" content="User Information" />
        </Head>
        <div className="onboarding-wrapper">
          <div className="onboaridng-layout-graphic">
            <h3>A few clicks away from creating your illumiDesk Account</h3>
          </div>

          <div className="simple-form-wrapper">
            <Form
              {...layout}
              name="userInfo"
              initialValues={{
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
              }}
              onFinish={this.onSubmit}
            >
              <div className="stacks-form">
                <div className="heading-label-form">
                  <h4>Set up Account</h4>
                  <p>Confirm your user account information</p>
                </div>

                <Form.Item
                  label="Organization Name"
                  name="organizationName"
                  rules={[FormRules.organizationName]}
                >
                  <Input maxLength={50} />
                </Form.Item>
                <Form.Item label="Email Address" name="email">
                  <Input readOnly={true} />
                </Form.Item>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your first name!',
                    },
                  ]}
                >
                  <Input maxLength={30} />
                </Form.Item>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please input your last name!' }]}
                >
                  <Input maxLength={30} />
                </Form.Item>
              </div>
              <div className="form-footer">
                <Button
                  type="primary"
                  className="btn-primary"
                  htmlType="submit"
                  disabled={this.state.disabled}
                  loading={this.state.loading}
                >
                  Setup Account
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </OnboardingHeader>
    );
  }
}

export const getServerSideProps = withAuth(null, { dontRedirect: true });

export default inject('store')(observer(UserInfo));
