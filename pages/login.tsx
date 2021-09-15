import { inject, observer } from 'mobx-react';
import { GetServerSideProps } from 'next';

import React from 'react';
import { withAuth } from '../lib/auth';

const Login = () => {
  return <div></div>;
};

export default inject('store')(observer(Login));

export const getServerSideProps: GetServerSideProps = withAuth(null, {
  notLoggedInPath: null,
  logoutRequired: true,
});
