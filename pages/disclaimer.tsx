/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import OnboardingHeader from 'components/common/OnboardingHeader';
import { DataServerSideProps, DisclaimerProps } from 'interfaces';
import Head from 'next/head';
import { withAuth } from 'lib/auth';
import { inject, observer } from 'mobx-react';
import { Button } from 'antd';
import notify from 'lib/notifier';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPEPUBLISHABLEKEY } from 'lib/consts';
import { fetchCheckoutSession } from 'lib/api/team-leader';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

const Disclaimer: FC<DisclaimerProps> = (props): JSX.Element => {
  const stripePromise = loadStripe(STRIPEPUBLISHABLEKEY);
  const { store, planId, planName } = props;
  const { currentOrganization } = store;

  const handleBilling = async (): Promise<void> => {
    const { sessionId } = await fetchCheckoutSession({
      mode: currentOrganization.billingId.isCard ? 'subscription' : 'setup',
      billingId: currentOrganization.billingId._id,
      planId: planId,
      planName: planName,
      returnUrl: `${window.location.origin}/plans`,
    });

    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      notify(error, 'error');
      console.error(error);
    }
  };
  return (
    <OnboardingHeader {...props}>
      <Head>
        <title>Disclaimer</title>
        <meta name="description" content="Disclaimer" />
      </Head>
      <div className="onboarding-wrapper">
        <div className="onboaridng-disclaimer-graphic">
          <h3>Payment Info Required</h3>
        </div>

        <div className="simple-form-wrapper">
          <div className="disclaimer-content">
            <img src="/Done.svg" />
            <h4>Disclaimer</h4>
            <p>
              Payment Information is required in order to proceed. We won't deduct any amount on
              Free Plan
            </p>
            <Button style={{ backgroundColor: '#417837' }} type="primary" onClick={handleBilling}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </OnboardingHeader>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(
  async (data: DataServerSideProps, context: GetServerSidePropsContext) => {
    return {
      ...data,
      props: {
        ...data.props,
        planName: context.query.planName,
        planId: context.query.planId,
      },
    };
  },
  { dontRedirect: true },
);
export default inject('store')(observer(Disclaimer));
