/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import '../styles/404.module.less';
import { checkInvitationVerification } from 'lib/api/public';
import { URL_API } from 'lib/consts';
import router from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

interface LinkProps {
  token: string;
}

const LinkExpire: React.FC<LinkProps> = (props): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<number>();

  const verifyLink = (token: string): void => {
    setLoading(true);
    setTimeout(async () => {
      const response = await checkInvitationVerification({ token: token });
      setStatus(response.status);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    verifyLink(props.token);
  }, []);

  useEffect(() => {
    if (status === 200) {
      setTimeout(() => {
        router.push(`${URL_API}/api/v1/auth0/login?token=${props.token}`);
      }, 2000);
    }
  }, [status]);

  return (
    <div>
      <Head>
        <title>Verification</title>
        <meta name="verification" content="verification" />
      </Head>
      <div className="logo-grid">
        <img src="/logo.svg" alt="logo" className="logo" />
      </div>

      {loading && (
        <div className="loading-state">
          <img src="/animation.gif" />
        </div>
      )}
      {status > 200 && !loading && (
        <div className="page-404 link-expire">
          <img src="/link-expire.svg" alt="error" className="link-expire-img" />
          <h3>Link Expired</h3>
          <p>
            Your link has been expired please contact your
            <br /> admin for more details
          </p>
        </div>
      )}
      {status === 200 && !loading && (
        <div className="page-404 link-expire">
          <img src="/link-verified.svg" alt="verified" className="link-expire-img" />
          <h3>Link Verified!</h3>
          <p>Your link has been verified</p>
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
      token: context.query.token,
    },
  };
};

export default LinkExpire;
