/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { GetServerSideProps } from 'next';
import '../styles/404.module.less';
import Head from 'next/head';
import { Button } from 'antd';
import { AccountDeactivateProps } from 'interfaces';
import { withAuth } from 'lib/auth';
import { inject, observer } from 'mobx-react';
import { URL_API } from 'lib/consts';

const AccountDeactivate: FC<AccountDeactivateProps> = (props): JSX.Element => {
  const { store } = props;
  const { currentUser, socket } = store;
  return (
    <div>
      <Head>
        <title>Account Deactivated</title>
        <meta name="description" content="Account Deactivated" />
      </Head>
      <div className="logo-grid">
        <img src="/logo.svg" alt="logo" className="logo" />
      </div>

      <div className="page-404 link-expire">
        <img src="/account-deactivate.svg" alt="error" className="banner_img" />
        <br />
        <h3>Account is deactivated!</h3>
        <p>
          You have deactivated your account associated with this email{' '}
          <strong>{currentUser.email}</strong>
          <br /> To activate your account, please contact illumidesk{' '}
          <a
            href="https://support.illumidesk.com/hc/en-us"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
          .
        </p>
        <Button
          className="btn-primary"
          type="primary"
          href={`${URL_API}/api/v1/auth0/logout`}
          onClick={() => {
            localStorage.removeItem('current');
            if (socket) {
              socket.disconnect();
            }
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
export const getServerSideProps: GetServerSideProps = withAuth(null, { dontRedirect: true });
export default inject('store')(observer(AccountDeactivate));
