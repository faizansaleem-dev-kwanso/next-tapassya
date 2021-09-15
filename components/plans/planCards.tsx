/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Card, Button, Tag } from 'antd';
import '../../styles/Plans.module.less';
import { inject, observer } from 'mobx-react';
import { PlanCardProps } from 'interfaces';
import router from 'next/router';
import { PlansEntity } from 'interfaces/organizationInterfaces';
import { handleBilling } from 'lib/handleBilling';

const PlanCards: FC<PlanCardProps> = (props): JSX.Element => {
  // Constants
  const { store } = props;
  const { currentOrganization, plans } = store;
  const currentPlanName = currentOrganization.billingId.planName;

  const handleClick = (plan: PlansEntity) => {
    let currentPlan: PlansEntity;
    plans.forEach((item) => {
      if (item.nickname === currentPlanName) {
        currentPlan = item;
      }
    });
    if (currentPlanName) {
      if (currentPlan.metadata.Conditional_Campus < plan.metadata.Conditional_Campus) {
        handleBilling(
          currentOrganization,
          plan.id,
          plan.nickname,
          `${window.location.origin}/plans`,
        );
      } else {
        router.push({
          pathname: 'review-downgrade',
          query: {
            planId: plan.id,
          },
        });
      }
    } else {
      handleBilling(
        currentOrganization,
        plan.id,
        plan.nickname,
        `${window.location.origin}/plans`,
        true,
      );
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
            <div className="plans-flex">
              <h1>
                {`$${plan.unit_amount / 100} `}
                <span>/mo</span>
              </h1>

              <Tag color="#D1FAE5">{plan.nickname.toUpperCase()}</Tag>
            </div>

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
              className="select-plan-btn"
              disabled={plan.id === currentOrganization.billingId.planId ? true : false}
              onClick={() => {
                handleClick(plan);
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
