/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, Divider, Form, Input } from 'antd';
import '../../styles/Settings.module.less';
import { TransferAccountForm, TransferAccountModalProps } from '../../interfaces/index';
import notify from 'lib/notifier';
import { inject, observer } from 'mobx-react';

const TransferAccountModal: FC<TransferAccountModalProps> = (props): JSX.Element => {
  const { store, organizationId } = props;
  const { currentOrganization, organizationStore } = store;
  const { transferOrganization } = organizationStore;
  const [visibility, setVisibility] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [visibility]);

  const changeVisibility = (): void => {
    setVisibility(!visibility);
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.value === currentOrganization.name) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  /**
   * This function handles form submission
   * @param formValues
   */
  const onFinish = async (formValues: TransferAccountForm): Promise<void> => {
    setLoading(!loading);
    const response = await transferOrganization({
      email: formValues.email,
      organizationId: organizationId ? organizationId : currentOrganization._id,
      type: 'TRANSFER-ORGANIZATION',
    });
    if (response.status === 200) {
      notify(response.message, 'success');
      form.resetFields();
      setLoading(!loading);
      props.setIsTransferred(true);
      changeVisibility();
    } else {
      setLoading(false);
      form.resetFields();
      notify(response.message, 'error');
    }
  };

  return (
    <div>
      <Button type="primary" danger onClick={changeVisibility}>
        Transfer Organization
      </Button>
      <Modal
        className="delete-team-modal transfer-modal"
        visible={visibility}
        footer={[]}
        onCancel={changeVisibility}
      >
        <div className="d-flex-caution">
          <div className="caution-grid">
            <img src="/Danger-icon.svg" />
          </div>
          <div>
            <h4>Are you Sure you want to Transfer?</h4>
            <p>You’ll lose complete access and all rights once you transfer your organization.</p>

            <Divider></Divider>
            <Form name="transferAccountForm" onFinish={onFinish} form={form}>
              <Form.Item
                label="Enter Transferee Email Address"
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Please input your transferee email',
                  },
                ]}
              >
                <Input type="text" placeholder="Enter Email" />
              </Form.Item>

              <div className="organization-danger">
                <Form.Item
                  label={`Enter "${currentOrganization.name}" to Confirm`}
                  name="organizationName"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your organization name',
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter Organization Name"
                    name="organizationName"
                    onChange={handleOrgNameChange}
                  />
                </Form.Item>
              </div>

              <div className="footer-flex">
                <Button type="link" onClick={changeVisibility} className="btn-outlined-cancel">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="btn-primary"
                  danger
                  disabled={disabled}
                  loading={loading}
                >
                  Transfer Organization
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default inject('store')(observer(TransferAccountModal));
