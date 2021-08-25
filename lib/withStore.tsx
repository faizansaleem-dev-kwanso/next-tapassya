import React from 'react';
import Router from 'next/router';
import * as NProgress from 'nprogress';
import { getStore, initStore, Store } from './store';

Router.events.on('routeChangeStart', () => {
  NProgress.start();
});

Router.events.on('routeChangeComplete', (url) => {
  NProgress.done();
  const store = getStore();
  if (store) {
    store.changeCurrentUrl(url);
  }
});

Router.events.on('routeChangeError', () => NProgress.done());

export default function withStore(App) {
  class AppWithMobx extends React.Component<{ initialState: any }> {
    private store: Store;

    constructor(props) {
      super(props);
      this.store = initStore(props.pageProps && props.pageProps.initialState);
    }

    public render() {
      return (
        <App
          {...this.props}
          mobxStore={this.store}
          teamStore={this.store.teamStore}
          stackStore={this.store.stackStore}
        />
      );
    }
  }

  return AppWithMobx;
}
