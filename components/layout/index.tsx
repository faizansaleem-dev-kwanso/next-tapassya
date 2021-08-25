import Router, { withRouter } from 'next/router';
import Link from 'next/link';
import React from 'react';
import { Avatar, Button, Dropdown, Layout, Menu, Typography, Tooltip } from 'antd';
import { observer } from 'mobx-react';
import {
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { CANNY_APP_ID, COMMON_ENTITY, URL_API } from '../../lib/consts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import OrganizationModal from '../organization/addOrganizationModal';
import '../../styles/Layout.module.less';
import InviteMemberModal from '../teams/inviteMemberModal';
import { LayoutProps } from '../../interfaces/index';
import * as io from 'socket.io-client';
import { isUserAdmin } from 'lib/api/role';
import notify from 'lib/notifier';
import Pluralize from 'pluralize';
import { capitalize } from 'lodash';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;
const date = new Date()
class LayoutComponent extends React.Component<LayoutProps> {
  state = {
    collapsed: false,
    visible: false,
    open: false,
    isAdmin: false,
    isInstructor: false,
    isOrganization: false,
    paymentFail: false,
  };

  // This function closes invite member modal
  onClose = () => {
    this.state.open ? this.setState({ open: false }) : this.setState({ open: true });
  };

  // This function toggles the sidebar
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  public componentWillUnmount() {
    const { store } = this.props;
    const { socket } = store;

    socket.disconnect();
  }

  // This method loads the widget scripts when component is mounted
  public async componentDidMount() {
    const { store, router } = this.props;
    const { currentOrganization, organizations, socket, organizationStore, currentUser } = store;
    const billing = currentOrganization.billingId;

    if (window && billing.isPaymentFailed) {
      window.location.pathname === '/plans'
        ? this.setState({ paymentFail: false })
        : this.setState({ paymentFail: true });
    }
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

    this.checkCurrentOrganization();

    if (router.query.organizationSlug) {
      const org = organizations.find(
        (organization) => organization.slug === router.query.organizationSlug,
      );
      if (!org) {
        router.push('/404');
      }
    }

    //Establishing socket connection
    if (!socket || !socket.connected) {
      const socket = io.connect(URL_API, {
        query: {
          id: currentUser._id,
        },
      });

      socket.on('message', async (payload) => {
        const organization = await organizationStore.transferInviteAccepted(
          currentOrganization.slug,
        );
        localStorage.setItem('current', organization.slug);
        notify(payload.message, 'success');
        router.push(`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`);
      });

      await store.setSocket(socket);
    }

    try {
      const response = await isUserAdmin();
      response.status === 200
        ? this.setState({
            isAdmin: response.isAdmin,
            isInstructor: response.isInstructor,
            isOrganization: response.isOrganization,
          })
        : '';
    } catch (error) {
      console.error(error);
    }
  }

  public propagateClick = (id: string) => (event) => {
    const element = document.getElementById(id);
    if (element && element['href']) {
      const url = new URL(element['href']);
      if (!url.pathname) {
        return;
      }
      event.preventDefault();
      Router.push(url.pathname);
    }
  };

  // This function handles collapsing of sidebar
  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };

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

  // This function gets default selected keys from store
  getDefaultSelected = () => {
    const { store } = this.props;
    const { currentOrganization } = store;
    const { pathname } = window.location;
    if (pathname === `/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`) {
      return ['0'];
    }
    if (pathname.startsWith('/feedback')) {
      return ['1'];
    }
    return [];
  };

  // This function determines whether the user is on on-boarding page or not
  isOnboardingPage = () => {
    const { store } = this.props;
    const { currentOrganization } = store;

    return !(
      currentOrganization &&
      currentOrganization.billingId.isCard &&
      typeof window !== 'undefined' &&
      window.location.pathname !== `/${currentOrganization.slug}/setup-complete` &&
      window.location.pathname !== `/${currentOrganization.slug}/start-trial`
    );
  };

  // This function renders logo SVG
  renderSVG() {
    return <img src="/logo.svg" alt="logo" />;
  }

  // This function renders logo on header depending on current screen of user, either on-boarding or projects
  renderHeaderLogo() {
    const { currentOrganization } = this.props.store;
    if (!this.isOnboardingPage()) {
      return (
        <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`}>
          <a>{this.renderSVG()}</a>
        </Link>
      );
    }
    if (this.isOnboardingPage()) {
      return this.renderSVG();
    }
    return (
      <Link href="/">
        <a>{this.renderSVG()}</a>
      </Link>
    );
  }

  render() {
    const { store, children, router } = this.props;
    const { currentUser, currentOrganization, organizations, organizationStore } = store;
    const { setCurrentOrganization } = organizationStore;
    const dividerIndex = organizations.findIndex(
      (organization) => organization.ownerId !== currentUser._id,
    );

    // This renders user avatar menu
    const menu = (
      <Menu onClick={this.handleMenuClick} className="profile-menu">
        {!this.isOnboardingPage() && (
          <>
            <Menu.Item key={1}>
              <label>Signed in as</label>
              <Tooltip title={currentUser.email}>
                <Title level={5} className="email-ellipsis">
                  {currentUser.email}
                </Title>
              </Tooltip>
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key={2}>
              <Link href="/profile-settings">
                <Button type="link">Account settings</Button>
              </Link>
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item key={3}>
          <Button
            href={`${URL_API}/api/v1/auth0/logout`}
            type="link"
            onClick={() => {
              localStorage.removeItem('current');
              store.socket.disconnect();
            }}
          >
            Sign out
          </Button>
        </Menu.Item>
      </Menu>
    );

    // This renders organization menu dropdown
    const organizationMenu = (
      <Menu className="profile-dropdown-menu">
        {organizations.map((organization, index) => {
            {!organization.isAccountDeactivate && (
              <Menu.Item
                key={index}
                data-key={organization._id}
                onClick={() => {
                  setCurrentOrganization(organization.slug);
                  localStorage.setItem('current', organization.slug);
                  router.push(`/${organization.slug}/${Pluralize(COMMON_ENTITY)}`);
                }}
              >
                <div className="dropdown-flex" key={index}>
                  <div
                    className="user-badge"
                    style={{
                      backgroundColor:
                        '#' + Math.floor(Math.random() * 16777215).toString(16) === '#417837'
                          ? 'black'
                          : '#' + Math.floor(Math.random() * 16777215).toString(16),
                    }}
                  >
                    {organization.name.charAt(0)}
                  </div>
                  <div>
                    <h5>{organization.name}</h5>
                  </div>
                </div>
              </Menu.Item>
            )}
            {dividerIndex - 1 === index && !organization.isAccountDeactivate && (
              <hr
                key={index}
                style={{
                  border: '1px',
                  height: '1px',
                  background: '#c4c3be',
                  width: '192px',
                }}
              ></hr>
            )}
        })}
        <Menu.Item key={4}>
          <OrganizationModal onCollapse={this.onCollapse} />
        </Menu.Item>
      </Menu>
    );

    // This renders the whole layout
    return (
      <Layout className="layout-wrapper">
        <div
          className="drawer-backdrop"
          style={{ display: !this.state.collapsed ? 'block' : '' }}
        ></div>
        {currentOrganization &&
          currentOrganization.billingId.isCard &&
          typeof window !== 'undefined' &&
          window.location.pathname !== `/${currentOrganization.slug}/setup-complete` &&
          window.location.pathname !== `/${currentOrganization.slug}/start-trial` && (
            <Sider
              theme="light"
              collapsible
              collapsed={this.state.collapsed}
              onCollapse={this.onCollapse}
              className="sidebar"
              width="256"
              breakpoint="md"
              collapsedWidth="0px"
            >
              <div className="logo for-mobile-toggle">
                {this.renderHeaderLogo()}

                <div>
                  {React.createElement(
                    this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                    {
                      className: 'trigger trigger-for-mobile',
                      onClick: this.toggle,
                    },
                  )}
                </div>
              </div>
              <Menu theme="light" mode="inline" selectedKeys={this.getDefaultSelected()}>
                <Menu.Item className="profile-dropdown-link" data-key="1" key={5}>
                  <Dropdown overlay={organizationMenu} trigger={['click']}>
                    <a
                      className="ant-dropdown-link d-flex-profile"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="d-flex-profile">
                        <div className="user-badge">{currentOrganization.name.charAt(0)}</div>
                        <div>
                          <h5>{currentOrganization.name}</h5>
                        </div>
                      </div>

                      <img src="/porfile-open.svg" alt="dropdown" />
                    </a>
                  </Dropdown>
                </Menu.Item>
                <Menu.Item key={6}>
                  <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`}>
                    <Button icon={<img src="/stacks.svg" alt="stacks" />} type="link">
                      {capitalize(Pluralize(COMMON_ENTITY))}
                    </Button>
                  </Link>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key={7}>
                  <Link href={`/${currentOrganization.slug}/team`}>
                    <Button icon={<img src="/Teams.svg" alt="stacks" />} type="link">
                      Teams
                    </Button>
                  </Link>
                </Menu.Item>
                <Menu.SubMenu
                  icon={<img src="/resources.svg" alt="resources" />}
                  title="Resources"
                  key={8}
                >
                  <Menu.Item key={9}>
                    <a href="https://docs.illumidesk.com" rel="noopener noreferrer" target="_blank">
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      <span>Documentation</span>
                    </a>
                  </Menu.Item>
                </Menu.SubMenu>
              </Menu>

              <Menu
                className="meun-bottom"
                theme="light"
                mode="inline"
                selectedKeys={this.getDefaultSelected()}
              >
                {currentOrganization.ownerId !== currentUser._id ? (
                  ''
                ) : (
                  <Menu.Item key={10}>
                    <Button
                      icon={<img src="/invite-member-icon.svg" alt="invite member" />}
                      onClick={() =>
                        window.innerWidth <= 1024
                          ? this.setState({ open: true, collapsed: true })
                          : this.setState({ open: true })
                      }
                      type="link"
                    >
                      Invite Member
                    </Button>
                  </Menu.Item>
                )}

                {currentOrganization.ownerId !== currentUser._id ? (
                  ''
                ) : (
                  <Menu.Item key={11}>
                    <Link href="/organization-settings">
                      <Button icon={<img src="/Setting-icon.svg" alt="settings" />} type="link">
                        Settings
                      </Button>
                    </Link>
                  </Menu.Item>
                )}
              </Menu>
            </Sider>
          )}
        <Layout className="site-layout">
          <Header className="site-layout-background">
            {currentOrganization &&
            typeof window !== 'undefined' &&
            window.location.pathname !== `/${currentOrganization.slug}/setup-complete` &&
            window.location.pathname !== `/${currentOrganization.slug}/start-trial`
              ? React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                  className: 'trigger',
                  onClick: this.toggle,
                })
              : this.renderHeaderLogo()}

            <div className="mobile-logo">
              <img src="/logo.svg" alt="logo" />
            </div>

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

          <Content>
            <div className="site-layout-background">
              <InviteMemberModal open={this.state.open} onClose={this.onClose} />
              {children}
            </div>
          </Content>
          <Footer className="ant-footer">
            © {moment().year()} IllumiDesk LLC
            {' - '}
            <a href="https://illumidesk.com/app-privacy">Privacy Policy</a>
            {' - '}
            <a href="https://illumidesk.com/app-terms">Terms of use</a>
            {' - '}
            <a href="https://illumidesk.com/cookies">Cookie Policy</a>
            <script src="https://t9b52gf3xdv7.statuspage.io/embed/script.js"></script>
          </Footer>
        </Layout>
      </Layout>
    );
  }

  /**
   * This method checks for current organization in localstorage
   */
  private async checkCurrentOrganization() {
    const { store, router } = this.props;
    const { currentOrganization, organizationStore, organizations } = store;
    const { setCurrentOrganization } = organizationStore;
    const slug = localStorage.getItem('current');

    if (slug === null) {
      localStorage.setItem('current', currentOrganization.slug);
    } else {
      if (currentOrganization.slug !== slug) {
        const organization = organizations.find((organization) => organization.slug === slug);
        if (organization) {
          setCurrentOrganization(slug);
        } else {
          if (router.query.organizationSlug) {
            const organization = organizations.find(
              (organization) => organization.slug === router.query.organizationSlug,
            );
            if (organization) {
              setCurrentOrganization(router.query.organizationSlug);
              localStorage.setItem('current', router.query.organizationSlug.toString());
            } else {
              router.push({
                pathname: '/404',
                query: {
                  error: 'You do not have access to this organization anymore',
                  redirectUrl: `/${organizations[0].slug}/${Pluralize(COMMON_ENTITY)}`,
                },
              });
            }
          }
        }
      }
    }
  }
}

export default withRouter<LayoutProps>(observer(LayoutComponent));
