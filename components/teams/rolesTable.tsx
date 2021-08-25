/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Tag, Table, Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { RolesTableProps } from '../../interfaces/index';
import '../../styles/Teams.module.less';

const RolesTable: FC<RolesTableProps> = (props): JSX.Element => {
  // Constants
  const { deleteRole, data } = props;
  const columns = [
    {
      title: 'Name',
      dataIndex: 'user',
      key: 'user',
      // eslint-disable-next-line react/display-name
      render: (user, index) => (
        <>
          <div className="user-role-info" key={index}>
            <Avatar
              src={user.avatarUrl !== '' || null ? user.avatarUrl : <UserOutlined />}
              style={{ backgroundColor: 'grey' }}
              size={40}
            />
            <div>
              <a className="user-name">{user.name}</a>
              <a className="user-email">{user.email}</a>
            </div>
          </div>
        </>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      // eslint-disable-next-line react/display-name
      render: (role, index) => <Tag key={index}>{role}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      // eslint-disable-next-line react/display-name
      render: (user, index) =>
        user.role !== 'ADMIN' && (
          <Button key={index} type="link" danger onClick={() => deleteRole(user)}>
            Delete
          </Button>
        ),
    },
  ];

  return (
    <div className="assign-role-table">
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default RolesTable;
