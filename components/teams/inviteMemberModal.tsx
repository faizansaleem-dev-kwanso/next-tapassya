/* eslint-disable react/prop-types */
import React, { FC, useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, Button, Input, Form, Select, List, Pagination, Dropdown, Menu } from 'antd';
import { MinusCircleOutlined, EllipsisOutlined } from '@ant-design/icons';
import { InviteMemberModalProps } from '../../interfaces/index';
import '../../styles/Teams.module.less';
import '../../styles/Layout.module.less';
import { InviteMemberModalForm } from '../../interfaces/index';
import { FormRules } from 'lib/consts';
import { sendInvite, getInvites, deleteInvites, resendInvites } from 'lib/api/invitation';
import notify from 'lib/notifier';
import { PAGE_SIZE } from 'lib/consts';
import { Paginate } from '../../interfaces/index';
import { InviteInterface } from 'interfaces/inviteInterfaces';
import NoResult from 'components/common/NoResult';

const { Option } = Select;

/**
 * This renders invite member modal with pending invites and with input fields
 * to send invite to
 * @param props
 * @returns
 */
const InviteMemberModal: FC<InviteMemberModalProps> = (props): JSX.Element => {
  // Constants
  const { open, onClose, store } = props;
  const { userStore, currentOrganization } = store;
  const { userRoles } = userStore;
  const [form] = Form.useForm();

  // States
  const [pendingInvites, setPendingInvites] = useState<InviteInterface[]>([]);
  const [pendingCount, setPendingCount] = useState<number>();
  const [paginate, setPaginate] = useState<Partial<Paginate>>({});
  const [buttonState, setButtonState] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * This function gets a list of pending invites from backend
   * @param {page}
   */
  const getPendingInvites = async ({ page }: { page: number }): Promise<void> => {
    const data = await getInvites({
      page: page,
      limit: PAGE_SIZE,
      organizationId: currentOrganization._id,
    });
    if (data.status === 200) {
      setPendingCount(data.invitationCount);
      setPendingInvites(data.invitations);
      setPaginate(data.paginator);
    } else {
      notify(data.message, 'error');
    }
  };

  // Here we get roles and pending invites on component mount
  useEffect(() => {
    userStore.getRoles();
    getPendingInvites({ page: 1 });
  }, []);

  /**
   * Here we disable 'Send Invite' button
   * Get pending invites
   * Reset form values
   * On Modal open or close
   */
  useEffect(() => {
    getPendingInvites({ page: 1 });
    setButtonState(true);
    form.resetFields();
  }, [open]);

  /**
   * This function sends request to delete the invitation
   * @param invitationId
   */
  const handleDeleteInvite = async (invitationId: string): Promise<void> => {
    const data = await deleteInvites(invitationId);
    if (data.status === 200) {
      getPendingInvites({ page: 1 });
      notify(data.message, 'success');
    } else {
      notify(data.message, 'error');
    }
  };

  /**
   * This function sends a request to backend to resend an expired invitation
   * @param {email, inviteId}
   */
  const handleResendInvite = async ({
    email,
    inviteId,
    roleId,
  }: {
    email: string;
    inviteId: string;
    roleId: string;
  }): Promise<void> => {
    setLoading(true);
    const data = await resendInvites({
      email: email,
      invitationId: inviteId,
      type: 'INVITE-MEMBER',
      organizationId: currentOrganization._id,
      roleId: roleId,
    });
    if (data.status === 200) {
      notify(data.message, 'success');
      setLoading(false);
      onClose();
    } else {
      setLoading(false);
      notify(data.message, 'error');
    }
  };

  /**
   * This function handles pagination
   * @param page
   */
  const handlePagination = (page: number) => {
    getPendingInvites({ page: page });
  };

  /**
   * This function handles form submission
   * Form values contains multiple roles and email addresses to be invited
   * @param formValues
   */
  const onSubmitForm = async (formValues: InviteMemberModalForm): Promise<void> => {
    if (formValues.extraMembers === undefined) {
      setLoading(true);
      const index = userRoles.findIndex((role) => role.role === formValues.role);
      const invitations = [
        {
          email: formValues.email,
          roleId: userRoles[index]._id,
          organizationId: currentOrganization._id,
          type: 'INVITE-MEMBER',
        },
      ];
      const response = await sendInvite({ invitations: invitations });
      if (response.status === 200) {
        setLoading(false);
        notify(response.message, 'success');
        form.resetFields();
        onClose();
      } else {
        setLoading(false);
        notify(response.message, 'error');
      }
    } else {
      setLoading(true);
      const invitations = [];
      const index = userRoles.findIndex((role) => role.role === formValues.role);
      invitations.push({
        email: formValues.email,
        roleId: userRoles[index]._id,
        organizationId: currentOrganization._id,
        type: 'INVITE-MEMBER',
      });
      formValues.extraMembers.map((member) => {
        const index = userRoles.findIndex((role) => role.role === member.role);
        invitations.push({
          email: member.email,
          roleId: userRoles[index]._id,
          organizationId: currentOrganization._id,
          type: 'INVITE-MEMBER',
        });
      });
      const response = await sendInvite({ invitations: invitations });
      if (response.status === 200) {
        setLoading(false);
        notify(response.message, 'success');
        form.resetFields();
        onClose();
      } else {
        setLoading(false);
        notify(response.message, 'error');
      }
    }
  };

  return (
    <div>
      <Modal
        className="invite-team-member modal-common-styling"
        visible={open}
        footer={[]}
        onCancel={onClose}
      >
        <Form name="add-member" onFinish={onSubmitForm} form={form}>
          <div className="stacks-form">
            <div className="heading-label-form">
              <div className="d-flex">
                <h4>Invite a Member</h4>
                <button className="icon-button" onClick={onClose}></button>
              </div>
              <p>Invite people in your organization by their email address</p>
            </div>
            <div className="d-flex">
              <Form.Item label="" name="email" rules={[FormRules.email]}>
                <Input
                  required={true}
                  type="email"
                  placeholder="name@work-email.com"
                  onFocus={() => setButtonState(false)}
                />
              </Form.Item>
              <Form.Item name="role" rules={[FormRules.role]}>
                <Select placeholder="Add Role">
                  {userRoles.map((item, index) => (
                    <Option key={index} value={item.role}>
                      {item.role.charAt(0).toUpperCase() + item.role.slice(1).toLowerCase()}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="shareable-link add-another-member">
              <Form.List name="extraMembers">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Form.Item key={field.key} className="add-more-input-grid">
                        <Form.Item
                          className="add-more-input"
                          {...field}
                          name={[field.name, 'email']}
                          fieldKey={[field.fieldKey, 'email']}
                          rules={[FormRules.email]}
                          key="1"
                        >
                          <Input placeholder="name@work-email.com" type="email" />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'role']}
                          fieldKey={[field.fieldKey, 'role']}
                          rules={[FormRules.role]}
                          className="select-role-form"
                          key="2"
                        >
                          <Select placeholder="Add Role">
                            {userRoles.map((item, index) => (
                              <Option key={index} value={item.role}>
                                {item.role.charAt(0).toUpperCase() +
                                  item.role.slice(1).toLowerCase()}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      </Form.Item>
                    ))}
                    <div className="shareable-link-actions d-flex">
                      <Button
                        type="link"
                        onClick={() => add()}
                        style={{ fontSize: '12px' }}
                        icon={<img src="/team-add-another-email.svg" />}
                      >
                        Add Another
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <div className="pending-invitations">
            <h3>
              Pending Invitations
              <div className="pending-badge">{pendingCount}</div>
            </h3>
            {pendingInvites.length === 0 && (
              <div className="not-found-data">
                <NoResult subText="You have no Invitations sent Yet" text="No Invites Sent!" />
              </div>
            )}
            <div className="mobile-view-actions">
              {pendingInvites.map((invite, index) => (
                <div key={index} className="flex-wrapper">
                  <div className="flex-tag">
                    <p>{invite.email}</p>
                    {invite.status === 'EXPIRED' && <span className="status-badge">EXPIRED</span>}
                  </div>
                  <Dropdown
                    overlay={() => (
                      <Menu>
                        {invite.status === 'EXPIRED' && (
                          <Menu.Item
                            onClick={() =>
                              handleResendInvite({
                                email: invite.email,
                                inviteId: invite._id,
                                roleId: invite.roleId,
                              })
                            }
                          >
                            Resend
                          </Menu.Item>
                        )}
                        <Menu.Item onClick={() => handleDeleteInvite(invite._id)}>Delete</Menu.Item>
                      </Menu>
                    )}
                    placement="bottomLeft"
                  >
                    <EllipsisOutlined style={{ transform: 'rotate(90deg)' }} />
                  </Dropdown>
                </div>
              ))}
            </div>

            <div className="desktop-view-actions">
              {pendingInvites.length !== 0 && (
                <List
                  itemLayout="horizontal"
                  dataSource={pendingInvites}
                  renderItem={(item, index) => (
                    <List.Item
                      key={index}
                      actions={[
                        <Button key="1" danger onClick={() => handleDeleteInvite(item._id)}>
                          Delete
                        </Button>,
                        item.status === 'EXPIRED'
                          ? [
                              <Button
                                type="primary"
                                key="2"
                                className="button-resend"
                                onClick={() =>
                                  handleResendInvite({
                                    email: item.email,
                                    inviteId: item._id,
                                    roleId: item.roleId,
                                  })
                                }
                              >
                                Resend
                              </Button>,
                            ]
                          : '',
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <>
                            <p>{item.email} </p>
                            {item.status === 'EXPIRED' ? (
                              <span className="status-badge">Expired</span>
                            ) : (
                              ''
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
          {paginate.totalDocs > 6 && (
            <div className="pagination-illumidesk">
              <p>
                Showing{' '}
                {paginate.pagingCounter !== 1 ? paginate.pagingCounter - 1 : paginate.pagingCounter}{' '}
                to{' '}
                {paginate.pagingCounter - 1 + paginate.limit > paginate.totalDocs
                  ? paginate.totalDocs
                  : paginate.pagingCounter - 1 + paginate.limit}{' '}
                of {paginate.totalDocs} results
              </p>

              <Pagination
                pageSize={PAGE_SIZE}
                current={paginate.page}
                total={paginate.totalDocs}
                onChange={handlePagination}
              />
            </div>
          )}

          <div className="modal-footer">
            <Button type="link" onClick={onClose} className="btn-outlined-cancel">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="btn-primary"
              disabled={buttonState}
              loading={loading}
            >
              Send Invite
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default inject('store')(observer(InviteMemberModal));
