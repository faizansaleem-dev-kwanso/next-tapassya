import * as React from 'react';
import router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import { Card, Col, Row, Button, Typography, Input, Badge, Pagination, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import NProgress from 'nprogress';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Head from 'next/head';
import Layout from '../../components/layout';
import { withAuth } from '../../lib/auth';
import notify from '../../lib/notifier';
import { getStatusAndComment } from '../../lib/stackStatus';
import Link from 'next/link';
import '../../styles/Home.module.less';
import '../../styles/Layout.module.less';
import '../../styles/Stacks.module.less';
import { StacksState, StacksProps } from 'interfaces';
import { ProjectCardInterface, ActionsInterface } from 'interfaces/projectsInterface';
import NoResult from 'components/common/NoResult';
import { COMMON_ENTITY, PAGE_SIZE } from '../../lib/consts';
import { acceptTransferOrg } from 'lib/api/organization';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';
import { capitalize } from 'lodash';
import { PlansEntity } from 'interfaces/organizationInterfaces';
import StacksModal from 'components/common/StacksModal';
const { Title } = Typography;
const pageSize: number = PAGE_SIZE;
/**
 * This function gets the project actions
 * @param actions
 * @returns
 */
const getStatusFromActions = (actions: [ActionsInterface]) => {
  const { className, text, classNameDot, comment } = getStatusAndComment(actions);
  return (
    <div className="status-grid">
      <Title level={5}>Status</Title>
      <Badge className={className}>
        <div className={classNameDot}></div>
        {comment === 'De-provisioning' ? 'De-provisioning' : text}
      </Badge>
    </div>
  );
};
/**
 * This function return project card with project information
 * @param stack
 * @returns
 */
const StackCard = (stack: ProjectCardInterface) => {
  const { id, name, subDomain, actions, setIsCopied } = stack;
  return (
    <Card className="stacks-card">
      <Link href={`${window.location.pathname}/${id}`}>
        <a>
          <Title level={5}>{name}</Title>
          <p>{`${subDomain}.illumidesk.com`}</p>
          {getStatusFromActions(actions)}
        </a>
      </Link>
      ​
      <div className="campus-link">
        <Tooltip title="Visit Link">
          <a href={`https://${subDomain}.illumidesk.com`} target="_blank" rel="noopener noreferrer">
            <img src="/visit-link.svg" />
          </a>
        </Tooltip>

        <Tooltip title="Copy Link">
          <CopyToClipboard
            onCopy={() => setIsCopied()}
            text={`https://${subDomain}.illumidesk.com`}
          >
            <img src="/copy-link.svg" />
          </CopyToClipboard>
        </Tooltip>
      </div>
    </Card>
  );
};
class Stacks extends React.Component<StacksProps, StacksState> {
  state = {
    loading: true,
    isCopy: false,
    search: '',
    disabled: false,
    showModal: false,
  };
  public async componentDidUpdate(prevProps) {
    const { initialState } = this.props;
    if (initialState.organizationSlug !== prevProps.initialState.organizationSlug) {
      const { store } = this.props;
      const { currentOrganization } = store;
      NProgress.start();
      try {
        await this.props.store.stackStore.getAllStacks({
          organizationId: currentOrganization._id,
          page: 1,
          limit: PAGE_SIZE,
        });
        this.setState({
          loading: false,
        });
      } catch (error) {
        notify(`Error in loading your ${Pluralize(COMMON_ENTITY)}`, 'error');
      } finally {
        NProgress.done();
      }
    }
  }
  // This function gets all projects from database
  public async componentDidMount() {
    const { store, initialState } = this.props;
    const { currentOrganization } = store;

    const transferToken = localStorage.getItem('transfer-token');
    if (transferToken) {
      const response = await acceptTransferOrg(transferToken);
      if (response.status === 200) {
        localStorage.removeItem('transfer-token');
        notify(response.message, 'success');
      } else {
        notify(response.message, 'error');
      }
    }
    if (!store.currentOrganization) {
      const slug = localStorage.getItem('current');
      const { organizationStore } = store;
      const { setOrganizations } = organizationStore;
      setOrganizations(initialState.organizations, slug);
    }

    NProgress.start();
    try {
      await this.props.store.stackStore.getAllStacks({
        organizationId: currentOrganization._id,
        page: 1,
        limit: PAGE_SIZE,
      });
      this.setState({
        loading: false,
      });
    } catch (error) {
      notify(`Error in loading your ${Pluralize(COMMON_ENTITY)}`, 'error');
      this.setState({
        loading: false,
      });
    } finally {
      NProgress.done();
    }
  }

  /**
   * This function checks if the current organization type is personal or not
   * If it is personal then user will have to pay first in order to create new project
   */
  handleShowModal = () => {
    const { router, store } = this.props;
    const { stacks, plans, currentOrganization } = store;
    const { billingId } = currentOrganization;
    const { planName } = billingId;
    let selectedPlan: PlansEntity = null;

    plans.forEach((plan) => {
      if (plan.nickname === planName) {
        selectedPlan = plan;
      }
    });

    if (selectedPlan && stacks.length >= +selectedPlan.metadata.Conditional_Campus) {
      this.setState({
        showModal: !this.state.showModal,
      });
    } else {
      router.push(`/${currentOrganization.slug}/new-${COMMON_ENTITY}`);
    }
  };

  /**
   * This functions handles pagination
   * @param page
   */
  handlePagination = async (page: number): Promise<void> => {
    const { store } = this.props;
    const { currentOrganization, stackStore } = store;
    const { getAllStacks, searchStack } = stackStore;
    if (this.state.search.length >= 3) {
      await searchStack({
        organizationId: currentOrganization._id,
        search: this.state.search,
        limit: PAGE_SIZE,
        page: page,
      });
    } else {
      await getAllStacks({
        organizationId: currentOrganization._id,
        page: page,
        limit: PAGE_SIZE,
      });
    }
  };
  /**
   * This function handles search
   * @param event
   */
  handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const { store } = this.props;
    const { searchStack, getAllStacks } = store.stackStore;
    const organization = store.currentOrganization;
    this.setState({ search: event.target.value }, async () => {
      if (this.state.search.length >= 3) {
        await searchStack({
          organizationId: organization._id,
          search: this.state.search,
          page: 1,
          limit: PAGE_SIZE,
        });
      } else {
        await getAllStacks({
          organizationId: organization._id,
          page: 1,
          limit: PAGE_SIZE,
        });
      }
    });
  };
  setIsCopied = (): void => {
    this.setState({ isCopy: !this.state.isCopy }, () => {
      notify('Link Copied to Clipboard!', 'success');
    });
  };
  // This function renders project cards with all the details
  public renderCards() {
    //Constants
    const { store } = this.props;
    const { paginate } = store.stackStore;
    const { totalDocs, limit, pagingCounter, page } = paginate;
    const stacks = store.stacks;
    if (this.state.loading) {
      return (
        <Row gutter={16} className="loader-wrapper">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Col key={n}>
              <Card style={{ width: 300, marginTop: 16 }} loading key={n}>
                <Card.Meta title="Card title" description="This is the description" />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    if (typeof window === 'undefined') {
      return null;
    }
    if (stacks.length === 0 && this.state.search.length === 0) {
      return (
        <div className="layout-banner">
          <div className="homepage-content">
            <div className="banner-text">
              <Title level={2}>
                Launch Interactive Learning Environments with <span>illumiDesk</span>
              </Title>
              <p>
                Quickly create engaging interactive web-based learning experiences that you will
                love.
              </p>
            </div>
            ​
            <Button type="primary" className="btn-primary" onClick={this.handleShowModal}>
              Create your First {capitalize(COMMON_ENTITY)}
            </Button>
          </div>
        </div>
      );
    }
    if (stacks.length === 0 && this.state.search.length !== 0) {
      return (
        <div>
          <div className="main-wrapper">
            <div className="page-header">
              <div className="search-input">
                <Title level={4}>{capitalize(Pluralize(COMMON_ENTITY))}</Title>

                <Input
                  size="large"
                  placeholder="Search"
                  value={this.state.search}
                  onChange={this.handleSearchChange}
                  prefix={<SearchOutlined />}
                />
              </div>
              ​
              <Button type="primary" className="btn-primary" onClick={this.handleShowModal}>
                Create a New {capitalize(COMMON_ENTITY)}
              </Button>
            </div>
            ​
            <div className="not-found-data">
              <NoResult
                subText={`No ${COMMON_ENTITY} found with this search name`}
                text={`No ${capitalize(Pluralize(COMMON_ENTITY))} Found!`}
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="main-wrapper">
          <div className="page-header">
            <div className="search-input">
              <Title level={4}>{capitalize(Pluralize(COMMON_ENTITY))}</Title>
              <Input
                size="large"
                placeholder="Search"
                value={this.state.search}
                onChange={this.handleSearchChange}
                prefix={<SearchOutlined />}
                className="search-input-desktop"
              />
            </div>
            ​
            <Button type="primary" className="btn-primary" onClick={this.handleShowModal}>
              Create a New {COMMON_ENTITY}
            </Button>
          </div>
          ​
          <div className="search-input search-input-mobile">
            <Input
              size="large"
              placeholder="Search"
              value={this.state.search}
              onChange={this.handleSearchChange}
              prefix={<SearchOutlined />}
            />
          </div>
          ​
          <div className="projects-card-wrapper">
            {stacks.map((stack) => (
              <StackCard
                key={stack._id}
                id={stack._id}
                name={stack.name}
                subDomain={stack.subDomain}
                actions={stack.actions}
                stage={stack.stage}
                setIsCopied={this.setIsCopied}
                isCopy={this.state.isCopy}
              />
            ))}
          </div>
          {totalDocs > 6 && (
            <div className="pagination-illumidesk">
              <p>
                Showing {pagingCounter} to{' '}
                {pagingCounter - 1 + limit > totalDocs ? totalDocs : pagingCounter - 1 + limit} of{' '}
                {totalDocs} results
              </p>
              ​
              <Pagination
                pageSize={pageSize}
                current={page}
                total={totalDocs}
                onChange={this.handlePagination}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
  public render() {
    const { store } = this.props;
    const { currentUser, currentOrganization, stacks } = store;
    if (!currentUser) {
      return null;
    }
    return (
      <Layout {...this.props}>
        <Head>
          <title>{capitalize(Pluralize(COMMON_ENTITY))}</title>
          <meta name="description" content={`${capitalize(Pluralize(COMMON_ENTITY))}`} />
        </Head>
        {currentOrganization.isTransferred && <OrganizationNotification />}
        {this.state.showModal && stacks.length < 2 ? (
          <StacksModal
            isShowModal={this.state.showModal}
            close={() => this.setState({ showModal: false })}
            action={() => router.push('/plans')}
            title={`You need to upgrade to create ${COMMON_ENTITY}`}
            subTitle=""
            buttonText="Upgrade"
          />
        ) : (
          <StacksModal
            isShowModal={this.state.showModal}
            close={() => this.setState({ showModal: false })}
            action={() => router.push('https://support.illumidesk.com/hc/en-us')}
            title={'To get customize Enterprise Plan please contact IllumiDesk Support'}
            subTitle=""
            buttonText="Contact Support"
          />
        )}
        <div>{this.renderCards()}</div>
      </Layout>
    );
  }
}

export const getServerSideProps = withAuth(null, { dontRedirect: true });
export default withRouter<StacksProps>(inject('store')(observer(Stacks)));
