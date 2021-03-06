/* eslint-disable react/prop-types */
import { Button } from 'antd';
import React, { FC } from 'react';
import Head from 'next/head';
import { inject, observer } from 'mobx-react';
import { withAuth } from '../lib/auth';
import { checkEmailVerification } from '../lib/api/public';
import notify from '../lib/notifier';
import '../styles/Stacks.module.less';
import '../styles/Layout.module.less';
import OnboardingHeader from 'components/common/OnboardingHeader';
import { GetServerSideProps } from 'next';
import { EmailVerifyProps } from 'interfaces';
import router from 'next/router';
import { COMMON_ENTITY } from 'lib/consts';
import Pluralize from 'pluralize';

const EmailVerify: FC<EmailVerifyProps> = (props): JSX.Element => {
  const { store } = props;
  const { organizations } = store;
  const continueToDashboard = async () => {
    const res = await checkEmailVerification();
    if (res.message) {
      notify(res.message, 'info', true);
    } else if (res.redirectTo) {
      if (res.success) {
        notify('Success. Redirecting to dashboard...', 'success', true);
      } else {
        notify('Redirecting to login...', 'info', true);
      }
      if (organizations.length === 0) {
        window.location.replace(res.redirectTo);
      } else {
        router.push(`/${organizations[0].slug}/${Pluralize(COMMON_ENTITY)}`);
      }
    } else {
      notify('Unable to find your verification status', 'info', true);
    }
  };
  return (
    <OnboardingHeader {...props}>
      <Head>
        <title>Email Verification</title>
        <meta name="description" content="Email Verification" />
      </Head>
      <div className="onboarding-wrapper">
        <div className="onboaridng-layout-graphic">
          <h3>A few clicks away from creating your illumiDesk Account</h3>
        </div>

        <div className="simple-form-wrapper email-verify">
          <div className="onboarding-form-header">
            <img src="/newsletter.svg" alt="newsletter" />
            <h4>Please verify your email to continue</h4>
            <p>
              To continue please verify your email address by clicking the link sent on <br /> your
              email
            </p>
          </div>

          <div className="text-center">
            <Button type="primary" onClick={continueToDashboard}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </OnboardingHeader>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(null, {
  dontRedirect: true,
  onVerificationPage: true,
});

export default inject('store')(observer(EmailVerify));
