/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import '../../styles/StripeCard.module.less';
import { StripeCardProps } from 'interfaces';
const StripeCard: FC<StripeCardProps> = (props): JSX.Element => {
  const { card } = props;
  const brand = card.card.brand;
  return (
    <div className="stripe-card">
      <img src={`/${brand}.svg`} alt={brand} width="24px" height="24px" />

      {brand !== 'amex' ? (
        <div className="card-number-wrapper">
          <div className="card-number">
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
          </div>

          <div className="card-number">
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
          </div>

          <div className="card-number">
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
          </div>

          <div className="card-number">
            <span>{card.card.last4.charAt(0)}</span>
            <span>{card.card.last4.charAt(1)}</span>
            <span>{card.card.last4.charAt(2)}</span>
            <span>{card.card.last4.charAt(3)}</span>
          </div>
        </div>
      ) : (
        <div className="card-number-wrapper">
          <div className="card-number">
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
          </div>

          <div className="card-number">
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
            <span>*</span>
          </div>

          <div className="card-number">
            <span>*</span>
            <span>{card.card.last4.charAt(0)}</span>
            <span>{card.card.last4.charAt(1)}</span>
            <span>{card.card.last4.charAt(2)}</span>
            <span>{card.card.last4.charAt(3)}</span>
          </div>
        </div>
      )}

      <div className="stripe-card-footer">
        <h5>{card.billing_details.name}</h5>

        <div className="card-expiry-date">
          <label>{`${card.card.exp_month} / ${card.card.exp_year}`}</label>
        </div>
      </div>
    </div>
  );
};

export default StripeCard;
