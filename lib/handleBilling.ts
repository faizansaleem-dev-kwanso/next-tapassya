import { loadStripe } from '@stripe/stripe-js';
import { OrganizationInterface } from 'interfaces/organizationInterfaces';
import router from 'next/router';
import { fetchCheckoutSession } from './api/team-leader';
import { STRIPEPUBLISHABLEKEY } from './consts';
import notify from './notifier';

const stripePromise = loadStripe(STRIPEPUBLISHABLEKEY);

export const handleBilling = async (
  currentOrganization: OrganizationInterface,
  planId: string,
  planName: string,
  returnURL: string,
  upgrade?: boolean,
) => {
  if (planName === 'Free' && upgrade) {
    router.push({
      pathname: '/disclaimer',
      query: { planId: planId, planName: planName },
    });
  } else {
    const { sessionId } = await fetchCheckoutSession({
      mode: currentOrganization.billingId.isCard ? 'subscription' : 'setup',
      billingId: currentOrganization.billingId._id,
      planId: planId,
      planName: planName,
      returnUrl: returnURL,
    });

    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      notify(error, 'error');
      console.error(error);
    }
  }
};
