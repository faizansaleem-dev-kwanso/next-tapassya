/* eslint-disable react/prop-types */
import React, { FC, useState } from 'react';
import { inject, observer } from 'mobx-react';
import '../../styles/Teams.module.less';
import { Modal, Button, Input } from 'antd';
import router from 'next/router';
import notify from 'lib/notifier';
import { DeleteOrganizationModalProps } from '../../interfaces/index';
import { OrganizationResponse } from 'interfaces/organizationInterfaces';
import { COMMON_ENTITY } from 'lib/consts';
import Pluralize from 'pluralize';

/**
 * This renders delete modal for organization
 * @param props
 * @returns
 */
const DeleteOrganizationModal: FC<DeleteOrganizationModalProps> = (props): JSX.Element => {
  // Constants
  const { store } = props;
  const { currentOrganization, organizations } = store;
  const { removeOrganization } = store.organizationStore;

  // States
  const [visibility, setVisibility] = useState<boolean>(false);
  const [input, setInput] = useState<string>();

  // This function opens or closes modal
  const changeVisibility = (): void => {
    setVisibility(!visibility);
  };

  // This function sends request to delete organization
  const handleDelete = async (): Promise<void> => {
    const response: OrganizationResponse = await removeOrganization(currentOrganization._id);
    if (response.status === 200) {
      notify(response.message, 'success');
      changeVisibility();
      localStorage.setItem('current', organizations[0].slug);
      router.push(`/${organizations[0].slug}/${Pluralize(COMMON_ENTITY)}`);
    } else {
      notify(response.message, 'error');
    }
  };

  return (
    <div>
      <Button
        className="delete-organization-button"
        type="default"
        // danger
        onClick={changeVisibility}
        disabled={currentOrganization.isDefaultOrganization}
      >
        Delete Organization
      </Button>
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
            <h4>Are you Sure you want to Delete Organization?</h4>
            <p>
              Are you sure you want to delete this organization? All data of this organization will
              also be deleted.
            </p>
            <hr></hr>
            <div>
              <p>Please type "{currentOrganization.name}" to confirm</p>
              <Input onChange={(e) => setInput(e.target.value)}></Input>
            </div>
            <hr></hr>
          </div>
        </div>

        <div className="remove-organization-footer">
          <Button key="1" type="text" className="btn-outlined-cancel" onClick={changeVisibility}>
            Cancel
          </Button>
          <Button
            key="2"
            type="primary"
            danger
            disabled={input === currentOrganization.name ? false : true}
            onClick={() => handleDelete()}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default inject('store')(observer(DeleteOrganizationModal));
