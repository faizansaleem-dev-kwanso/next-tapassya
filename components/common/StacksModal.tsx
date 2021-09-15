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
  extraText,
  close,
  action,
}): JSX.Element => {
  const [value, setValue] = useState<string>('');
  const buttonTexts = [
    'Deactivate',
    'Delete',
    'Stop',
    'Deploy',
    'Upgrade',
    'Contact Support',
    `Delete ${capitalize(COMMON_ENTITY)}`,
    'Deactivate',
  ];
  const disableCheck = () => {
    switch (buttonText === 'Delete' && name === value) {
      case true:
        return false;
      case false:
        switch (buttonTexts.includes(buttonText) && buttonText !== 'Delete') {
          case true:
            return false;
          case false:
            return true;
          default:
            break;
        }
      default:
        break;
    }
  };
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
              buttonText === 'Deactivate' || buttonText === 'Delete' || buttonText === 'Stop'
                ? true
                : false
            }
            disabled={disableCheck()}
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
            <div className="delete-modal-txt">
              <p>{extraText}</p>
            </div>
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
