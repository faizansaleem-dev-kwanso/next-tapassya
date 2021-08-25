import { withRouter } from 'next/router';
import React from 'react';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import { observer } from 'mobx-react';
import {
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CANNY_APP_ID, URL_API } from '../../lib/consts';
import '../../styles/Layout.module.less';
import { OnboardingHeaderProps } from '../../interfaces/index';

const { Header } = Layout;

class LayoutComponent extends React.Component<OnboardingHeaderProps> {
  state = {
    collapsed: false,
    visible: false,
  };

  // This function toggles the sidebar
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  // This method loads the widget scripts when component is mounted
  public componentDidMount() {
    (function (w, d, i) {
      function l() {
        if (!d.getElementById(i)) {
          const f = d.getElementsByTagName('script')[0],
            e = d.createElement('script');
          (e.type = 'text/javascript'),
            (e.async = !0),
            (e.src = 'https://canny.io/sdk.js'),
            f.parentNode.insertBefore(e, f);
        }
      }
      if ('function' != typeof w.Canny) {
        const c = function () {
          // eslint-disable-next-line
          c.q.push(arguments);
        } as any;
        (c.q = []),
          (w.Canny = c),
          'complete' === d.readyState
            ? l()
            : w.attachEvent
            ? w.attachEvent('onload', l)
            : w.addEventListener('load', l, !1);
      }
    })(window as any, document, 'canny-jssdk');
    (window as any).Canny('initChangelog', {
      appID: CANNY_APP_ID,
      position: 'bottom',
      align: 'right',
    });
  }

  // This handles user avatar menu click
  handleMenuClick = (e) => {
    if (e.key === '3') {
      this.setState({ visible: false });
    }
  };

  // This shows/hides user avatar menu dropdown
  handleVisibleChange = (flag) => {
    this.setState({ visible: flag });
  };

  // This function renders logo SVG
  renderSVG() {
    return <img src="/logo.svg" alt="logo" />;
  }

  render() {
    const { store, children } = this.props;
    const { currentOrganization, currentUser } = store;

    const menu = (
      <Menu onClick={this.handleMenuClick} className="profile-menu">
        <Menu.Item key="3">
          <Button href={`${URL_API}/api/v1/auth0/logout`} type="link">
            Sign out
          </Button>
        </Menu.Item>
      </Menu>
    );

    return (
      <>
        <Header className="site-layout-background">
          {currentOrganization &&
          typeof window !== 'undefined' &&
          window.location.pathname !== `/${currentOrganization.slug}/setup-complete` &&
          window.location.pathname !== `/${currentOrganization.slug}/start-trial`
            ? React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: this.toggle,
              })
            : this.renderSVG()}

          {currentUser && (
            <div className="header-flex">
              <div className="header-badges">
                <Button
                  shape="circle"
                  icon={<BellOutlined />}
                  size="middle"
                  data-canny-changelog
                  className="notification"
                />
                <Dropdown
                  overlay={menu}
                  onVisibleChange={this.handleVisibleChange}
                  trigger={['click']}
                  visible={this.state.visible}
                >
                  <Avatar
                    src={
                      currentUser.avatarUrl !== '' ? (
                        <img src={currentUser.avatarUrl} />
                      ) : (
                        <UserOutlined />
                      )
                    }
                    size={32}
                    style={{ backgroundColor: 'grey' }}
                    alt={`Logo of ${currentUser.firstName}`}
                  />
                </Dropdown>
              </div>
            </div>
          )}
        </Header>

        <div>{children}</div>
      </>
    );
  }
}

export default withRouter<OnboardingHeaderProps>(observer(LayoutComponent));
