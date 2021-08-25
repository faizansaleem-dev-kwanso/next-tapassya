/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Card, Button, Tag } from 'antd';
import { fetchCheckoutSession } from 'lib/api/team-leader';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPEPUBLISHABLEKEY } from 'lib/consts';
import notify from 'lib/notifier';
import '../../styles/Plans.module.less';
import { inject, observer } from 'mobx-react';
import { PlanCardProps } from 'interfaces';
import router from 'next/router';

const PlanCards: FC<PlanCardProps> = (props): JSX.Element => {
  // Constants
  const stripePromise = loadStripe(STRIPEPUBLISHABLEKEY);
  const { store } = props;
  const { currentOrganization, plans } = store;

  const handleBilling = async (id: string, planName: string): Promise<void> => {
    if (planName === 'Free') {
      router.push({
        pathname: '/disclaimer',
        query: { planId: id, planName: planName },
      });
    } else {
      const { sessionId } = await fetchCheckoutSession({
        mode: currentOrganization.billingId.isCard ? 'subscription' : 'setup',
        billingId: currentOrganization.billingId._id,
        planId: id,
        planName: planName,
        returnUrl: `${window.location.origin}/plans`,
      });

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        notify(error, 'error');
        console.error(error);
      }
    }
  };

  return (
    <>
      {plans.map((plan, index) => (
        <Card
          key={index}
          style={
            plan.id === currentOrganization.billingId.planId
              ? { border: '9px solid rgb(65, 120, 55)' }
              : {}
          }
        >
          <div className="card-details">
            <Tag color="#D1FAE5">{plan.nickname.toUpperCase()}</Tag>
            <h1>
              {`$${plan.unit_amount / 100} `}
              <span>/mo</span>
            </h1>
            <p>{plan.metadata.Bullet_Title}</p>
          </div>
          <div className="features">
            <ul>
              <li key="0">
                <img src="/Green-Tick.svg" />
                Campus {plan.metadata.Conditional_Campus}
              </li>
              <li key="1">
                {plan.metadata.Bullet_Team ? <img src="/Green-Tick.svg" /> : ''}
                {plan.metadata.Bullet_Team}
              </li>
              <li key="2">
                {plan.metadata.Bullet_Organization ? <img src="/Green-Tick.svg" /> : ''}
                {plan.metadata.Bullet_Organization}
              </li>
              <li key="3">
                {plan.metadata.Bullet_Project ? <img src="/Green-Tick.svg" /> : ''}
                {plan.metadata.Bullet_Project}
              </li>
              <li key="4">
                {plan.metadata.Bullet_Notebook ? <img src="/Green-Tick.svg" /> : ''}
                {plan.metadata.Bullet_Notebook}
              </li>
              <li key="5">
                {plan.metadata.Bullet_Trial && <img src="/Green-Tick.svg" />}
                {plan.metadata.Bullet_Trial}
              </li>
            </ul>
            <Button
              type="primary"
              disabled={plan.id === currentOrganization.billingId.planId ? true : false}
              onClick={() => {
                handleBilling(plan.id, plan.nickname);
              }}
            >
              {plan.id === currentOrganization.billingId.planId ? 'Current Plan' : 'Select Plan'}
            </Button>
          </div>
        </Card>
      ))}
    </>
  );
};

export default inject('store')(observer(PlanCards));
