/* eslint-disable react/prop-types */
import { Badge, Button, Card, Tooltip, Typography } from 'antd';
import { ActionsInterface, ProjectCardInterface } from 'interfaces/projectsInterface';
import TeamCard from '../teams/teamCard';
import React, { FC, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getStatusAndComment } from 'lib/stackStatus';
import TransferModal from '../common/transferAccountModal';
import { ResourceCardProps } from 'interfaces';

import '../../styles/Resources.module.less';
import StacksSVG from '../common/stacksSVG';
import TeamsSVG from '../common/teamsSVG';

const { Title } = Typography;

const ResourceCard: FC<ResourceCardProps> = (props): JSX.Element => {
  const [key, setKey] = useState<string>('Campuses');

  const [isTransferred, setIsTransferred] = useState<boolean>();

  const { defaultOrg, projects, orgTransferred, teams, organizationName, plan } = props;

  const tabList = [
    {
      key: 'Campuses',
      tab: (
        <span>
          <StacksSVG /> Campuses
        </span>
      ),
    },
    {
      key: 'Teams',
      tab: (
        <span>
          <TeamsSVG /> Teams
        </span>
      ),
    },
  ];

  const onTabChange = (key) => {
    setKey(key);
  };

  const renderTeams = (): JSX.Element => {
    const avatarUrls = [];
    teams.forEach((team) => {
      const urls = [];
      team.members.forEach((member) => {
        urls.push(member.userId.avatarUrl);
      });
      avatarUrls.push(urls);
    });

    return (
      <div className="resource-card-teams">
        {teams.map((team, index) => (
          <TeamCard
            key={index}
            title={team.name}
            defaultTeam={team.defaultTeam}
            content={team.description}
            slug={team.slug}
            teamId={team._id}
            memberView={false}
            resourceView={true}
            avatarUrls={avatarUrls[index]}
          />
        ))}
      </div>
    );
  };

  const RenderStackCard = (): JSX.Element => {
    return (
      <>
        {projects.length <= 0 && (
          <div className="empty-state">
            <img height="120" width="150" src="/empty-campus-state.svg" />
            <p>No campuses yet in this organization</p>
          </div>
        )}
        <div className="resource-card-stacks">
          {projects.length > 0 &&
            projects.map((stack) => (
              <StackCard
                key={stack._id}
                id={stack._id}
                name={stack.name}
                subDomain={stack.subDomain}
                actions={stack.actions}
                stage={stack.stage}
                setIsCopied={() => {}}
                isCopy={false}
              />
            ))}
        </div>
      </>
    );
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
    const { name, subDomain, actions, setIsCopied } = stack;
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
            <a
              href={`https://${subDomain}.illumidesk.com`}
              target="_blank"
              rel="noopener noreferrer"
            >
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
  return (
    <Card
      className="resource-card"
      title={organizationName}
      tabList={tabList}
      extra={
        defaultOrg || plan === 'Free' ? (
          <></>
        ) : orgTransferred || isTransferred ? (
          <Button type="primary" className="btn-primary" danger disabled={true}>
            Pending Transfer Request
          </Button>
        ) : (
          <TransferModal setIsTransferred={setIsTransferred} />
        )
      }
      onTabChange={(key) => {
        onTabChange(key);
      }}
    >
      {key === 'Campuses' ? RenderStackCard() : renderTeams()}
    </Card>
  );
};

export default ResourceCard;
