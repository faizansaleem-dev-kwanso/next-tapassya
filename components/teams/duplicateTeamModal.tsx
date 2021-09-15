/* eslint-disable react/prop-types */
import React, { FC, useState } from 'react';
import { Form, Button, Typography, Input, Modal } from 'antd';
import { DuplicateModalProps } from '../../interfaces/index';
import notify from '../../lib/notifier';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import '../../styles/Teams.module.less';
import { NewTeamModalForm } from '../../interfaces/index';
import { TeamResponse } from '../../interfaces/teamInterfaces';
import { FormRules } from 'lib/consts';
import { useEffect } from 'react';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * This renders an input modal for a team to be duplicated
 * @param props
 * @returns
 */
const DuplicateTeamModal: FC<DuplicateModalProps> = (props): JSX.Element => {
  // Constants
  const { aboutTeam, onClose, store, teamStore } = props;
  const { currentOrganization } = store;
  const { addTeam } = teamStore;
  const [form] = Form.useForm();

  // States
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
  }, [open]);

  /**
   * This function handles form submission by sending request with data
   * to backend
   * @param formValues
   */
  const onSubmit = async (formValues: NewTeamModalForm): Promise<void> => {
    try {
      const response: TeamResponse = await addTeam({
        name: formValues.teamName,
        description: formValues.aboutTeam,
        organizationId: currentOrganization._id,
      });
      if (response.status == 200) {
        form.resetFields();
        setOpen(!open);
        notify(response.message, 'success');
      } else {
        notify(response.message, 'error');
      }
    } catch (error) {
      notify(error, 'error');
    }
  };

  // This function opens or closes modal
  const onCancel = (): void => {
    setOpen(!open);
  };

  return (
    <div>
      <Button
        icon={<img src="/Duplicate-icon.svg" />}
        type="link"
        onClick={() => {
          setOpen(!open);
          onClose();
        }}
      >
        Duplicate
      </Button>
      <Modal visible={open} footer={[]} onCancel={onCancel} className="add-team-dialog">
        <Form
          name="duplicateTeam"
          form={form}
          onFinish={onSubmit}
          initialValues={{ aboutTeam: aboutTeam }}
        >
          <div className="stacks-form">
            <div className="heading-label-form">
              <Title level={5}>Enter your Team Name</Title>
              <p>Please add your Team Name and Description to create</p>
            </div>

            <Form.Item name="teamName" label="Team Name" rules={[FormRules.teamName]}>
              <Input required={true} />
            </Form.Item>
            <Form.Item name="aboutTeam" label="About Team">
              <TextArea rows={3} />
            </Form.Item>
          </div>

          <div className="form-footer">
            <Button type="text" className="btn-outlined-cancel" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="btn-primary">
              Duplicate Team
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default withRouter<DuplicateModalProps>(
  inject('teamStore', 'store')(observer(DuplicateTeamModal)),
);
