/* eslint-disable react/prop-types */
import React, { FC, useState, useEffect } from 'react';
import { Form, Button, Typography, Input, Modal } from 'antd';
import { AddTeamModalProps } from '../../interfaces/index';
import notify from '../../lib/notifier';
import router, { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import '../../styles/Teams.module.less';
import { NewTeamModalForm } from '../../interfaces/index';
import { TeamResponse } from '../../interfaces/teamInterfaces';
import { FormRules } from 'lib/consts';
import { PlansEntity } from 'interfaces/organizationInterfaces';
import StacksModal from 'components/common/StacksModal';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * This renders the modal when new team is to be added or
 * an existing team needs to be edited
 * It differentiates on the basis of flag 'edit'
 * @param props
 * @returns
 */
const NewTeamModal: FC<AddTeamModalProps> = (props): JSX.Element => {
  // Constants
  const { edit, teamName, aboutTeam, onClose, store, teamId, teamStore } = props;
  const { currentOrganization, plans, teams } = store;
  const { billingId } = currentOrganization;
  const { planName } = billingId;
  const { updateTeam, addTeam } = teamStore;
  const [form] = Form.useForm();

  // States
  const [open, setOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    form.resetFields();
  }, [open]);

  /**
   * This function handles form submission
   * @param formValues
   */
  const onSubmit = async (formValues: NewTeamModalForm): Promise<void> => {
    if (edit) {
      const response: TeamResponse = await updateTeam({
        name: formValues.teamName,
        description: formValues.aboutTeam,
        teamId: teamId,
        avatarUrl: '',
      });
      response.status === 200
        ? (setOpen(!open), notify(response.message, 'success'))
        : notify(response.message, 'error');
    } else {
      const response: TeamResponse = await addTeam({
        name: formValues.teamName,
        description: formValues.aboutTeam,
        organizationId: currentOrganization._id,
      });
      response.status === 200
        ? (form.resetFields(), setOpen(!open), notify(response.message, 'success'))
        : notify(response.message, 'error');
    }
  };

  // This function closes modal
  const onCancel = (): void => {
    setOpen(!open);
  };

  const handleShowModal = () => {
    let selectedPlan: PlansEntity = null;

    plans.forEach((plan) => {
      if (plan.nickname === planName) {
        selectedPlan = plan;
      }
    });
    console.log(selectedPlan.metadata, '<<<<<METADATA');
    if (selectedPlan.metadata.Conditional_Team) {
      if (selectedPlan && teams.length >= +selectedPlan.metadata.Conditional_Team) {
        setShowModal(true);
      } else {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div>
      {edit === true ? (
        <Button
          icon={<img src="/Edit-icon.svg" />}
          type="link"
          onClick={() => {
            setOpen(!open);
            onClose();
          }}
        >
          Edit
        </Button>
      ) : (
        <Button type="primary" onClick={handleShowModal}>
          Create a New Team
        </Button>
      )}

      {showModal && (
        <StacksModal
          isShowModal={showModal}
          close={() => setShowModal(false)}
          action={() => router.push('/plans')}
          title={`You need to upgrade to create teams`}
          subTitle=""
          buttonText="Upgrade"
        />
      )}

      <Modal visible={open} footer={[]} onCancel={onCancel} className="add-team-dialog">
        <Form
          name="newTeam"
          form={form}
          onFinish={onSubmit}
          initialValues={edit === true ? { teamName: teamName, aboutTeam: aboutTeam } : {}}
        >
          <div className="stacks-form">
            <div className="heading-label-form">
              <Title level={5}>
                {edit === true ? 'Edit your Team Details' : 'Enter your Team Name'}
              </Title>
              <p>
                {edit === true
                  ? 'Edit your team details and press save to apply these changes'
                  : 'Please add your Team Name and Description to create Team'}
              </p>
            </div>

            <Form.Item name="teamName" label="Team Name" rules={[FormRules.teamName]}>
              <Input maxLength={32} />
            </Form.Item>
            <Form.Item name="aboutTeam" label="About Team">
              <TextArea rows={3} maxLength={256} />
            </Form.Item>
          </div>

          <div className="form-footer">
            <Button type="text" className="btn-outlined-cancel" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="btn-primary">
              {edit === true ? 'Save Changes' : 'Create Team'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default withRouter<AddTeamModalProps>(inject('teamStore', 'store')(observer(NewTeamModal)));
