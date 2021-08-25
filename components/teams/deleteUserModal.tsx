/* eslint-disable react/prop-types */
import React, { FC, useState } from 'react';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';
import '../../styles/Teams.module.less';
import { Modal, Button, Input } from 'antd';
import { DeleteModalProps } from '../../interfaces/index';
import notify from 'lib/notifier';
import { TeamMemberResponse } from 'interfaces/teamInterfaces';
import SVG from '../common/deleteUserSvg';

/**
 * This renders delete modal for team and user depending on 'team' flag
 * @param props
 * @returns
 */
const DeleteModal: FC<DeleteModalProps> = (props): JSX.Element => {
  // Constants
  const { team, onClose, teamId, memberId, userId, name, teamStore, store } = props;
  const { currentTeam, currentOrganization } = store;
  const { deleteTeam, deleteTeamMember, deleteTeamMemberFromOrganization } = teamStore;

  // States
  const [visibility, setVisibility] = useState<boolean>(false);
  const [input, setInput] = useState<string>();

  // This opens or closes modal
  const changeVisibility = (): void => {
    setVisibility(!visibility);
  };

  /**
   * This function either sends request to delete team or
   * sends request to delete team member by checking the 'team' flag
   */
  const handleDelete = async (): Promise<void> => {
    if (team) {
      try {
        const response = await deleteTeam(teamId);
        if (response.status === 200) {
          notify(response.message, 'success');
          setVisibility(!visibility);
        } else {
          notify(response.message, 'error');
        }
      } catch (error) {
        notify(error, 'error');
      }
    } else {
      if (currentTeam.defaultTeam) {
        try {
          const response: TeamMemberResponse = await deleteTeamMemberFromOrganization({
            userId: userId,
            memberId: memberId,
            organizationId: currentOrganization._id,
          });
          if (response.status === 200) {
            notify(response.message, 'success');
            setVisibility(!visibility);
          } else {
            notify(response.message, 'error');
          }
        } catch (error) {
          notify(error, 'error');
        }
      } else {
        try {
          const response = await deleteTeamMember(memberId);
          if (response.status === 200) {
            notify(response.message, 'success');
            setVisibility(!visibility);
          } else {
            notify(response.message, 'error');
          }
        } catch (error) {
          notify(error, 'error');
        }
      }
    }
  };

  // This function deletes user from team as well as organization
  const handleDeleteFromOrganization = async (): Promise<void> => {
    const response: TeamMemberResponse = await deleteTeamMemberFromOrganization({
      userId: userId,
      memberId: memberId,
      organizationId: currentOrganization._id,
    });
    if (response.status === 200) {
      notify(response.message, 'success');
      setVisibility(!visibility);
    } else {
      notify(response.message, 'error');
    }
  };

  return (
    <div>
      {team !== true && (
        <Button type="link" icon={<SVG />} onClick={changeVisibility} className="delete-dialog" />
      )}
      {team === true && (
        <Button
          type="link"
          icon={<img src="/delete-icon.svg" />}
          onClick={() => {
            changeVisibility();
            onClose();
          }}
        >
          Delete
        </Button>
      )}
      <Modal
        className="delete-team-modal"
        visible={visibility}
        footer={[]}
        onCancel={changeVisibility}
      >
        <div className="d-flex-caution">
          <div className="caution-grid">
            <img src="/Danger-icon.svg" />
          </div>
          <div className="modal-body">
            <h4>
              {team !== true
                ? currentTeam.defaultTeam
                  ? 'Are you Sure you want to remove this member from your organization'
                  : 'Are you Sure you want to remove this member from your team?'
                : 'Are you Sure you want to Delete Team?'}
            </h4>
            <p>
              {team !== true
                ? 'Are you sure you want to remove this member? All of this members rights will be lost.'
                : 'Are you sure you want to delete this team? All members added to this team will also be removed.'}
            </p>
            <hr></hr>
            {team && (
              <div>
                <p>Please type "{currentTeam.name}" to confirm</p>
                <Input onChange={(e) => setInput(e.target.value)}></Input>
                <hr></hr>
              </div>
            )}
          </div>
        </div>
        <div className="remove-organization-footer">
          <Button key="1" type="link" className="btn-outlined-cancel" onClick={changeVisibility}>
            Cancel
          </Button>
          <Button
            key="2"
            type="primary"
            disabled={team && input !== name ? true : false}
            danger
            onClick={() => handleDelete()}
          >
            {team !== true ? 'Remove Member' : 'Delete'}
          </Button>
        </div>
        {team !== true && !currentTeam.defaultTeam && (
          <div className="remove-organization-card">
            <p>Remove this Member from your Organization?</p>

            <button type="button" onClick={handleDeleteFromOrganization}>
              Remove from Organization
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default withRouter<DeleteModalProps>(inject('teamStore', 'store')(observer(DeleteModal)));
