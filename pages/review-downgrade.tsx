/* eslint-disable react/prop-types */
import React, { FC, useEffect, useState } from 'react';
import Layout from '../components/layout/index';
import { ReviewDowngradeProps } from 'interfaces';
import { Badge, Button, Card, Modal, Tooltip, Typography } from 'antd';
import { getStatusAndComment } from 'lib/stackStatus';
import {
  ActionsInterface,
  ProjectCardInterface,
  ProjectInterface,
} from 'interfaces/projectsInterface';
import { inject, observer } from 'mobx-react';
import { withAuth } from 'lib/auth';
import { GetServerSideProps } from 'next';
import { deleteStack } from 'lib/api/stacks';
import '../styles/Resources.module.less';
import Head from 'next/head';
import { capitalize } from 'lodash';
import { COMMON_ENTITY } from 'lib/consts';
import StacksModal from 'components/common/StacksModal';
import notify from 'lib/notifier';
import { useRouter } from 'next/router';
import { PlansEntity } from 'interfaces/organizationInterfaces';
import { handleBilling } from 'lib/handleBilling';
import Pluralize from 'pluralize';

const { Title } = Typography;

const ReviewDowngrade: FC<ReviewDowngradeProps> = (props): JSX.Element => {
  const { store } = props;
  const { currentOrganization, plans, stackStore, resourceStacks } = store;
  const { getResourceStacks, removeResourceStack } = stackStore;
  const currentPlanId = currentOrganization.billingId.planId;
  const router = useRouter();
  const [project, setProject] = useState<ProjectInterface>();
  const [isShowModalDelete, setIsShowModalDelete] = useState<boolean>(false);
  const [newPlan, setNewPlan] = useState<PlansEntity>();
  const [currentPlan, setCurrentPlan] = useState<PlansEntity>();
  const [limit, setLimit] = useState<number>(0);

  const getPlanInformation = () => {
    plans.forEach((plan) => {
      if (plan.id === router.query.planId) {
        setNewPlan(plan);
      } else if (currentPlanId === plan.id) {
        setCurrentPlan(plan);
      }
    });
  };

  useEffect(() => {
    getResourceStacks();
    getPlanInformation();
  }, []);

  useEffect(() => {
    if (currentPlan && newPlan) {
      setLimit(+currentPlan.metadata.Conditional_Campus - +newPlan.metadata.Conditional_Campus);
    }
  }, [newPlan, currentPlan]);

  const RenderStackCard = (): JSX.Element => {
    return (
      <div className="resource-card-stacks">
        {resourceStacks.length <= 0 && (
          <h1>No {Pluralize(COMMON_ENTITY)} You Can Proceed To Downgrade</h1>
        )}
        {resourceStacks.length > 0 &&
          resourceStacks.map((stack, index) => (
            <StackCard
              key={stack._id}
              id={stack._id}
              name={stack.name}
              subDomain={stack.subDomain}
              actions={stack.actions}
              stage={stack.stage}
              setIsCopied={() => {}}
              isCopy={false}
              index={index}
            />
          ))}
      </div>
    );
  };

  const deleteProject = async (id: string) => {
    try {
      const response = await deleteStack(id);
      if (response.status === 200) {
        removeResourceStack(id);
        notify(`${capitalize(COMMON_ENTITY)} deleted`, 'success');
      } else {
        notify(response.message, 'error');
      }
    } catch (error) {
      console.log('error', error);

      Modal.error({
        title: 'Error!',
        content: (
          <div>
            <p>Unable to delete {COMMON_ENTITY}</p>
          </div>
        ),
        okText: 'Ok',
      });
    }
  };

  const handleDelete = (index: number) => {
    setIsShowModalDelete(true);
    setProject(resourceStacks[index]);
  };

  const getStatusFromActions = (actions: [ActionsInterface]): JSX.Element => {
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

  // This function renders project card with project details
  const StackCard = (stack: ProjectCardInterface) => {
    const { name, subDomain, actions, index } = stack;
    const { text } = getStatusAndComment(actions);
    return (
      <Card className="stacks-card">
        <a>
          {name.length > 21 && (
            <Tooltip title={name} placement="topLeft">
              <Title level={5}>{name.substring(0, 21)}...</Title>
            </Tooltip>
          )}
          {name.length <= 21 && <Title level={5}>{name}</Title>}
          <p>{`${subDomain}.illumidesk.com`}</p>
          {getStatusFromActions(actions)}
        </a>
        ​
        <div className="campus-link">
          <Tooltip title="Visit Link">
            <Button
              type="link"
              icon={<img src="/visit-link.svg" />}
              href={`https://${subDomain}.illumidesk.com`}
              target="_blank"
            />
          </Tooltip>
          {(text === 'Running' || text === 'Stopped') && (
            <Button
              type="link"
              icon={<img src="/delete-icon.svg" />}
              onClick={() => handleDelete(index)}
            />
          )}
        </div>
      </Card>
    );
  };

  return (
    <Layout {...props}>
      <Head>
        <title>Review Downgrade</title>
        <meta name="review downgrade" content="review downgrade" />
      </Head>
      <div className="main-wrapper organization-settings">
        <div className="resource-header-main">
          <div className="resource-header">
            {newPlan && (
              <>
                <h4>Switching to {newPlan.nickname} Plan</h4>
                {resourceStacks.length > limit && (
                  <p>
                    {newPlan.nickname} Plan includes only {newPlan.metadata.Conditional_Campus}{' '}
                    {COMMON_ENTITY}. In order to downgrade, please delete{' '}
                    {+currentPlan.metadata.Conditional_Campus -
                      +newPlan.metadata.Conditional_Campus}{' '}
                    of your {Pluralize(COMMON_ENTITY)} to proceed.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <Card className="resource-card" title={currentOrganization.name}>
          {RenderStackCard()}
        </Card>
        <div className="proceed-button">
          <Button
            type="primary"
            onClick={() =>
              handleBilling(
                currentOrganization,
                newPlan.id,
                newPlan.nickname,
                `${window.location.origin}/review-downgrade?planId=${newPlan.id}`,
              )
            }
            disabled={resourceStacks.length <= limit ? false : true}
          >
            Proceed to downgrade
          </Button>
        </div>
      </div>
      {project && (
        <StacksModal
          isShowModal={isShowModalDelete}
          name={project.name}
          action={() => deleteProject(project._id)}
          close={() => setIsShowModalDelete(false)}
          title={`Are you Sure you want to Delete ${capitalize(COMMON_ENTITY)}?`}
          subTitle={'All of your data will be deleted permanently. This action can not be undone.'}
          extraText={`Please type "${project.name}" to confirm`}
          buttonText="Delete"
        />
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(null, { dontRedirect: true });
export default inject('store')(observer(ReviewDowngrade));
