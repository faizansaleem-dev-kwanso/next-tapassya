/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import { Card, Avatar, Button, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import DeleteModal from '../../components/teams/deleteUserModal';
import '../../styles/Teams.module.less';
import { TeamMemberCardProps } from '../../interfaces/index';
import { inject, observer } from 'mobx-react';
import Link from 'next/link';
import { withAuth } from 'lib/auth';
import { isUserAdmin } from 'lib/api/role';
import { GetServerSideProps } from 'next';
/**
 * This renders team member card with his/her email, name and delete icon
 * @param props
 * @returns
 */
const MemberCard: FC<TeamMemberCardProps> = (props): JSX.Element => {
  const { team, initialState, user, store } = props;
  const { currentOrganization, currentUser } = store;
  const currentTeam = initialState.selectedTeam.team;

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isMember, setIsMember] = useState<boolean>(false);

  const checkRole = async (): Promise<void> => {
    const response = await isUserAdmin();
    if (response.status === 200) {
      setIsAdmin(response.isAdmin);
      setIsMember(response.isMember);
    }
  };

  useEffect(() => {
    checkRole();
  }, []);

  return (
    <Card bordered={team ? true : false} className="members-card">
      <div>
        <Avatar
          size={70}
          icon={
            user.userId.avatarUrl !== '' || null ? (
              <img src={user.userId.avatarUrl} />
            ) : (
              <UserOutlined />
            )
          }
          style={{ backgroundColor: 'grey' }}
        />
      </div>

      <div className="card-text">
        {(isAdmin && currentOrganization.ownerId === currentUser._id) ||
        (isMember && currentOrganization.ownerId === currentUser._id) ? (
          <Link
            href={`/${currentOrganization.slug}/team/${currentTeam.slug}/user-details/${user._id}`}
          >
            <div style={{ cursor: 'pointer' }} className="username">
              <Tooltip
                title={`${user.userId.firstName} ${user.userId.lastName}`}
                placement={user.userId.firstName.length < 25 ? 'topLeft' : 'top'}
              >
                <Button type="link">{`${user.userId.firstName} ${user.userId.lastName}`}</Button>
              </Tooltip>

              <p>{user.userId.email}</p>
              {team && <p>Teams: 2</p>}
            </div>
          </Link>
        ) : (
          <div style={{ cursor: 'pointer' }} className="username">
            <Tooltip
              title={`${user.userId.firstName} ${user.userId.lastName}`}
              placement={user.userId.firstName.length < 25 ? 'topLeft' : 'top'}
            >
              <Button type="link">{`${user.userId.firstName} ${user.userId.lastName}`}</Button>
            </Tooltip>
            <p>{user.userId.email}</p>
            {team && <p>Teams: 2</p>}
          </div>
        )}
      </div>
      {!team &&
        ((isAdmin && currentOrganization.ownerId === currentUser._id) ||
          (isMember && currentOrganization.ownerId === currentUser._id)) && (
          <DeleteModal
            initialState={initialState}
            userId={user.userId._id}
            memberId={user._id}
            team={false}
          />
        )}
    </Card>
  );
};

export const getServerSideProps: GetServerSideProps = withAuth(null, { dontRedirect: true });
export default inject('store')(observer(MemberCard));
