/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { Alert } from 'antd';

const OrganizationNotification: FC = (): JSX.Element => {
  return (
    <div className="organization-notification">
      <Alert
        message="Organization Ownership Pending"
        type="error"
        showIcon
        icon={
          <div className="icon-avatar">
            <img src="/caution.svg" alt="caution" />
          </div>
        }
      />
    </div>
  );
};

export default OrganizationNotification;
