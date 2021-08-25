/* eslint-disable react/prop-types */

import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, Typography, Input } from 'antd';
import { StackModalInterface } from '../../interfaces';
import '../../styles/StacksModal.module.less';
import { capitalize } from 'lodash';
import { COMMON_ENTITY } from 'lib/consts';

const { Title } = Typography;

const StacksModal: FC<StackModalInterface> = ({
  title,
  name,
  subTitle,
  buttonText,
  isShowModal,
  close,
  action,
}): JSX.Element => {
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    setValue('');
  }, [isShowModal]);
  return (
    <>
      <Modal
        className="delete-services-modal"
        visible={isShowModal}
        onCancel={() => close()}
        footer={[
          <Button
            key="submit"
            type="primary"
            className="btn-outlined"
            onClick={() => {
              setValue('');
              close();
            }}
          >
            Cancel
          </Button>,
          <Button
            key="link"
            type="primary"
            danger={
              buttonText === 'Deactivate' || `Delete ${capitalize(COMMON_ENTITY)}` ? true : false
            }
            disabled={
              buttonText === 'Delete' && value === name
                ? false
                : buttonText === 'Stop' ||
                  buttonText === 'Deploy' ||
                  buttonText === 'Upgrade' ||
                  buttonText === `Delete ${capitalize(COMMON_ENTITY)}` ||
                  buttonText === 'Deactivate'
                ? false
                : true
            }
            onClick={() => {
              buttonText === 'Upgrade' ? action('setup') : action();
              close();
            }}
          >
            {buttonText}
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
            <Title level={5}>{title}</Title>
            <p>{subTitle}</p>
            {buttonText === 'Delete' && (
              <Input
                placeholder="Type here"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                type="text"
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StacksModal;
