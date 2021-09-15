/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import '../styles/404.module.less';
import Head from 'next/head';
import { Button } from 'antd';
import { useRouter } from 'next/router';

const InvalidEmail: FC = (): JSX.Element => {
  const router = useRouter();
  const email = router.query.email;
  return (
    <div>
      <Head>
        <title>Invalid Email</title>
        <meta name="description" content="Invalid Email" />
      </Head>
      <div className="logo-grid">
        <img src="/logo.svg" alt="logo" className="logo" />
      </div>

      <div className="page-404 link-expire">
        <img src="/invalid-email.svg" alt="error" className="banner_img" />
        <br />
        <h3>Email not matched!</h3>
        <p>
          Sorry, your account email does not match <br />
          with invitation email.
          <br /> Invite Email ID is: <strong>{email}</strong>
        </p>
        <Button className="btn-primary" type="primary" href="https://www.illumidesk.com/">
          Home
        </Button>
      </div>
    </div>
  );
};

export default InvalidEmail;
