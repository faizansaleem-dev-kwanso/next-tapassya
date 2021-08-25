/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import { Modal, Button, Form, Input } from 'antd';
import '../../styles/Organization.module.less';
import { OrganizationModalForm } from '../../interfaces/index';
import { COMMON_ENTITY, FormRules } from 'lib/consts';
import { OrganizationModalProps } from '../../interfaces/index';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import notify from 'lib/notifier';
import Pluralize from 'pluralize';

/**
 * This renders a modal for organization to be added
 * @param props
 * @returns
 */
const OrganizationModal: FC<OrganizationModalProps> = (props): JSX.Element => {
  // States
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Constants
  const { addOrganization } = props.store.organizationStore;
  const [form] = Form.useForm();
  const { edit, open, store, router, onCollapse } = props;
  const { currentOrganization, organizationStore } = store;
  const { editOrganization } = organizationStore;

  //Here we reset form values whenever a modal is opened or closed
  useEffect(() => {
    form.resetFields();
  }, [isModalVisible]);

  useEffect(() => {
    if (edit) {
      setIsModalVisible(open);
    }
  }, []);

  /**
   * This function handles form submission
   * @param formValues
   */
  const handleSubmit = async (formValues: OrganizationModalForm): Promise<void> => {
    if (edit) {
      setLoading(!loading);
      const response = await editOrganization({
        name: formValues.organizationName,
        organizationId: currentOrganization._id,
      });
      response.status === 200
        ? (notify(response.message, 'success'),
          setIsModalVisible(!isModalVisible),
          setLoading(!loading),
          router.push(`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`),
          form.resetFields())
        : notify(response.message, 'error');
    } else {
      setLoading(!loading);
      const response = await addOrganization({
        name: formValues.organizationName,
      });
      response.status === 200
        ? (notify(response.message, 'success'),
          setIsModalVisible(!isModalVisible),
          setLoading(!loading),
          form.resetFields())
        : notify(response.message, 'error'),
        setLoading(false);
    }
  };

  //This opens and closes modal
  const handleClick = (): void => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <div>
      {edit ? (
        ''
      ) : (
        <Button
          type="link"
          className="add-organization"
          onClick={() => {
            handleClick();
            window.innerWidth <= 1024 ? onCollapse(true) : onCollapse(false);
          }}
          icon={<img src="/green-plus-icon.svg" />}
        >
          Add Organization
        </Button>
      )}
      <Modal
        footer={[]}
        visible={isModalVisible}
        maskClosable={edit ? false : true}
        onCancel={edit ? () => {} : handleClick}
        closable={edit ? false : true}
        className="organization-detail-modal modal-common-styling"
      >
        <Form
          onFinish={handleSubmit}
          form={form}
          initialValues={edit ? { organizationName: currentOrganization.name } : {}}
        >
          <div className="form-padding">
            <div className="heading-label-form">
              <h4>Organization Details</h4>
              <p>Please Enter Organization Name to Create a New Organization</p>
            </div>

            <Form.Item
              label="Organization Name"
              name="organizationName"
              rules={[FormRules.organizationName]}
            >
              <Input required={true} maxLength={50} />
            </Form.Item>
          </div>

          <div className="form-footer">
            {edit ? (
              ''
            ) : (
              <Button type="text" onClick={handleClick} className="btn-outlined-cancel">
                Cancel
              </Button>
            )}
            <Button type="primary" htmlType="submit" loading={loading}>
              {edit ? 'Update Organization' : 'Add Organization'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default withRouter<OrganizationModalProps>(inject('store')(observer(OrganizationModal)));
