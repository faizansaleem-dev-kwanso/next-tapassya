/* eslint-disable react/prop-types */

import React, { FC } from 'react';
import { Modal, Button, Typography } from 'antd';
import '../../styles/StacksModal.module.less';
import { URL_API } from 'lib/consts';
import { useRouter } from 'next/router';

const { Title } = Typography;

const PaymentFailModal: FC = (): JSX.Element => {
  const router = useRouter();
  return (
    <>
      <Modal
        className="delete-services-modal"
        visible={true}
        maskClosable={true}
        closable={false}
        footer={[
          <Button
            key="submit"
            type="link"
            href={`${URL_API}/api/v1/auth0/logout`}
            onClick={() => {
              localStorage.removeItem('current');
            }}
          >
            Logout
          </Button>,
          <Button
            key="link"
            type="link"
            onClick={() => {
              router.push('/plans');
            }}
          >
            Upgrade
          </Button>,
        ]}
      >
        <div className="modal-content-inner">
          <div>
            <Button type="primary" shape="circle">
              <img src="/caution.svg" alt="caution" />
            </Button>
          </div>
          <div>
            <Title level={5}>Payment Failed</Title>
            <p>Your have to pay to keep using services</p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentFailModal;
