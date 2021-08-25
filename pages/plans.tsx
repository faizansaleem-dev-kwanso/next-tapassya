import React from 'react';
import '../styles/Plans.module.less';
import Cards from '../components/plans/planCards';
// import OnboardingHeader from 'components/common/OnboardingHeader';
import Layout from 'components/layout';
import Head from 'next/head';
import { withAuth } from '../lib/auth';
import { PlansProps } from 'interfaces';
import { inject, observer } from 'mobx-react';
import router from 'next/router';

const Plans: React.FC<PlansProps> = (props): JSX.Element => {
  return (
    <Layout {...props}>
      <div className="main-plans">
        <Head>
          <title>Pricing Plans</title>
          <meta name="description" content="Pricing Plans" />
        </Head>
        <div className="main-plans-header">
          <div className="text-left">
            <button className="back_btn" onClick={() => router.back()}>
              <img src="back.svg" />
              Back
            </button>
          </div>

          <h5>PRICING</h5>
          <h1>The Right Plan for You</h1>
          <p>Select the Plan you feel will be suitable for your size of Organization</p>
          <div className="container">
            <Cards />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = withAuth(null, { dontRedirect: true });
export default inject('store')(observer(Plans));
