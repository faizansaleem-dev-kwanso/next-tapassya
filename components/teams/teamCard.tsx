/* eslint-disable react/prop-types */
import React, { useState, FC } from 'react';
import { Card, Popover, Button, Avatar } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import '../../styles/Teams.module.less';
import { TeamCardProps } from '../../interfaces/index';
import DeleteModal from './deleteUserModal';
import EditModal from './newTeamModal';
import DuplicateModal from './duplicateTeamModal';
import { observer, inject } from 'mobx-react';
import Link from 'next/link';
import { UserOutlined } from '@ant-design/icons';

/**
 * This renders team cards with their respective details
 * @param props
 * @returns
 */
const TeamCard: FC<TeamCardProps> = (props): JSX.Element => {
  const {
    title,
    content,
    memberView,
    slug,
    memberDetailView,
    teamId,
    defaultTeam,
    resourceView,
    store,
    avatarUrls,
    initialState,
  } = props;
  const { setCurrentTeam, currentOrganization } = store;

  const [visibile, setVisible] = useState<boolean>(false);

  // This opens or closes modal
  const visibleChange = (): void => {
    setVisible(!visibile);
  };

  // This function sets the current team in store which is later on used in different components of application
  const handleClick = () => {
    setCurrentTeam(slug);
  };

  const MemberViewPopOverContent = (
    <div>
      <DeleteModal
        initialState={initialState}
        team={false}
        onClose={visibleChange}
        teamId={teamId}
      />
    </div>
  );

  const PopOverContent = (
    <div>
      <EditModal
        edit={true}
        teamName={title}
        aboutTeam={content}
        teamId={teamId}
        onClose={visibleChange}
      />
      <DuplicateModal aboutTeam={content} onClose={visibleChange}></DuplicateModal>
      {!defaultTeam && (
        <DeleteModal
          initialState={initialState}
          team={true}
          name={title}
          teamId={teamId}
          onClose={visibleChange}
        />
      )}
    </div>
  );

  return (
    <Card className="team-card" onClick={handleClick}>
      {window.location.href.includes('resources') ? (
        <div className="link-url-grid">
          <div className="d-flex-team">
            <Button type="link">
              <h5>{title}</h5>
            </Button>

            {defaultTeam ? <div className="default-badge">Default</div> : ''}
          </div>
          {window.location.href.includes('user-details') ? (
            <>
              <p>
                {content && content.substring(0, 50)} {content && content.length > 50 && '...'}
              </p>
            </>
          ) : (
            <>
              <p>
                {content && content.substring(0, 80)} {content && content.length > 80 && '...'}
              </p>
            </>
          )}
        </div>
      ) : (
        <Link href={`/${currentOrganization.slug}/team/${slug}`}>
          <div className="link-url-grid">
            <div className="d-flex-team">
              <Link href={`/${currentOrganization.slug}/team/${slug}`}>
                <Button type="link">
                  <h5>{title}</h5>
                </Button>
              </Link>

              {defaultTeam ? <div className="default-badge">Default</div> : ''}
            </div>
            {window.location.href.includes('user-details') ? (
              <>
                <p>
                  {content && content.substring(0, 50)} {content && content.length > 50 && '...'}
                </p>
              </>
            ) : (
              <>
                <p>
                  {content && content.substring(0, 80)} {content && content.length > 80 && '...'}
                </p>
              </>
            )}
          </div>
        </Link>
      )}

      <div className="card-actions">
        {!memberDetailView && !window.location.href.includes('resources') && (
          <Popover
            content={memberView !== true ? PopOverContent : MemberViewPopOverContent}
            trigger="click"
            placement="bottomRight"
            style={{ borderRadius: '6px' }}
            visible={visibile}
            onVisibleChange={visibleChange}
          >
            <EllipsisOutlined key="ellipsis" />
          </Popover>
        )}
        {resourceView && (
          <div className="card-actions-resource">
            <Avatar.Group maxCount={3}>
              {avatarUrls.map((url, index) => (
                <Avatar key={index} icon={url !== '' ? <img src={url} /> : <UserOutlined />} />
              ))}
            </Avatar.Group>
          </div>
        )}
      </div>
    </Card>
  );
};

export default inject('store')(observer(TeamCard));
