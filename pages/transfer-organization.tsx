/* eslint-disable react/prop-types */
import { TransferVerificationProps } from 'interfaces';
import { acceptTransferOrg } from 'lib/api/organization';
import { URL_API, COMMON_ENTITY } from 'lib/consts';
import notify from 'lib/notifier';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { withRouter } from 'next/router';
import Pluralize from 'pluralize';

import React, { FC, useEffect, useState } from 'react';

const TransferVerification: FC<TransferVerificationProps> = (props): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true);
  const { token, router } = props;

  const verifyInvite = async (): Promise<void> => {
    const slug = localStorage.getItem('current');
    if (slug) {
      const response = await acceptTransferOrg(token);
      if (response.status === 200) {
        setLoading(false);
        localStorage.removeItem('transfer-token');
        setTimeout(() => {
          window.location.href = `/${slug}/${Pluralize(COMMON_ENTITY)}`;
        }, 1000);
      } else {
        localStorage.removeItem('transfer-token');
        notify(response.message, 'error');
      }
    } else {
      router.push(`${URL_API}/api/v1/auth0/login`);
    }
  };

  useEffect(() => {
    localStorage.setItem('transfer-token', props.token);
    setTimeout(() => {
      verifyInvite();
    }, 1000);
  }, []);

  return (
    <div>
      <Head>
        <title>Verification</title>
        <meta name="verification" content="verification" />
      </Head>
      {loading && (
        <div className="loading-state">
          <img src="/animation.gif" />
        </div>
      )}
      {!loading && (
        <div className="page-404 link-expire">
          <img src="/link-verified.svg" alt="verified" className="link-expire-img" />
          <h3>Organization Transferred!</h3>
          <p>Organization has been transfered successfully</p>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  return {
    props: {
      token: context.query.token ? context.query.token : '',
    },
  };
};

export default withRouter<TransferVerificationProps>(TransferVerification);
