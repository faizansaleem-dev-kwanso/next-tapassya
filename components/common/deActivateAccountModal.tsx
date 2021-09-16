import { Button, Input, Modal } from 'antd';
import { deactivateAccount } from 'lib/api/team-leader';
import { URL_API } from 'lib/consts';
import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DeActivateModal: FC = () => {
  const [input, setInput] = useState<string>('');
  const [visibility, setVisibility] = useState<boolean>(false);
  const router = useRouter();
  const changeVisibility = () => {
    setVisibility(!visibility);
  };

  useEffect(() => {
    setInput('');
  }, [visibility]);
  return (
    <div>
      <Button className="deactivate-button" type="primary" danger onClick={changeVisibility}>
        Deactivate
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
            <h4>Are you Sure you want to Deactivate your account?</h4>
            <p>Your account will be no longer accessible after deactivating.</p>
            <hr></hr>
            <div className="delete-modal-txt">
              <p>Please type "Deactivate" to confirm</p>
              <Input onChange={(e) => setInput(e.target.value)} value={input}></Input>
              <hr></hr>
            </div>
          </div>
        </div>
        <div className="remove-organization-footer">
          <Button key="1" type="link" className="btn-outlined-cancel" onClick={changeVisibility}>
            Cancel
          </Button>
          <Button
            key="2"
            type="primary"
            disabled={input === 'Deactivate' ? false : true}
            danger
            onClick={async () => {
              const response = await deactivateAccount();
              if (response.status === 200) {
                router.push(`${URL_API}/api/v1/auth0/logout`);
              }
            }}
          >
            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DeActivateModal;
