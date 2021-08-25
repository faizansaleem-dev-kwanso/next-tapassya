/* eslint-disable react/prop-types */
import Head from 'next/head';
import '../styles/styles.less';
import '../styles/antd.less';
import PropTypes from 'prop-types';
import { Provider } from 'mobx-react';
import React from 'react';
import { SWRConfig } from 'swr';
import fetch from '../lib/fetchJson';
import withStore from '../lib/withStore';

function App(props) {
  const { Component, pageProps, mobxStore, teamStore, stackStore } = props;
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </Head>
      <SWRConfig
        value={{
          fetcher: fetch,
          onError: (err) => {
            console.error(err);
          },
        }}
      >
        <Provider store={mobxStore} teamStore={teamStore} stackStore={stackStore}>
          <Component {...pageProps} />
        </Provider>
      </SWRConfig>
    </>
  );
}

App.propTypes = {
  Component: PropTypes.any,
  pageProps: PropTypes.object,
  mobxStore: PropTypes.any,
};

export default withStore(App);
