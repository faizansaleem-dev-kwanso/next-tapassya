/* eslint-disable react/prop-types */
import React, { useState, FC, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import '../../styles/Layout.module.less';
import { Modal, List, Checkbox, Input, Tag, Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AddMemberModalProps } from 'interfaces';
import {
  MappedTeamMemberInterface,
  MembersToAddInterface,
  TeamMemberTagInterface,
} from 'interfaces/teamInterfaces';
import { getOrganizationDefaultTeam } from 'lib/api/organization';
import { getMemberList } from 'lib/api/team-member';
import NoResult from 'components/common/NoResult';
import notify from 'lib/notifier';
import { PAGE_SIZE } from 'lib/consts';
/**
 * This function renders a modal with a list of users to be added in team
 * @param props
 * @returns JSX
 */
const AddMemberModal: FC<AddMemberModalProps> = (props): JSX.Element => {
  // Constants
  const { currentOrganization, currentTeam, teamStore } = props.store;
  const { addMemberToTeam } = teamStore;

  // States
  const [open, setOpen] = useState<boolean>(false);
  const [tags, setTags] = useState<TeamMemberTagInterface[]>([]);
  const [membersToAdd, setMembersToAdd] = useState<MembersToAddInterface[]>([]);
  const [members, setMembers] = useState<MappedTeamMemberInterface[]>([]);
  const [search, setSearch] = useState<string>('');

  // This function gets the list of members already present in organization
  const getAllMembers = async (): Promise<void> => {
    const data = await getOrganizationDefaultTeam(currentOrganization._id);
    if (data.status === 200) {
      const teamDetails = await getMemberList({ teamId: data.team._id, page: 1, limit: PAGE_SIZE });
      if (teamDetails.status === 200) {
        const mappedData = teamDetails.teamMembers.map((teamMember) => {
          return {
            user: {
              id: teamMember.userId._id,
              name: teamMember.userId.firstName + ' ' + teamMember.userId.lastName,
              firstName: teamMember.userId.firstName,
              lastName: teamMember.userId.lastName,
              email: teamMember.userId.email,
              avatarUrl: teamMember.userId.avatarUrl,
            },
            checked: false,
          };
        });
        setMembers(mappedData);
      } else {
        notify(teamDetails.message, 'error');
      }
    } else {
      notify(data.message, 'error');
    }
  };

  // Here we get members whenever component is mounted
  useEffect(() => {
    getAllMembers();
  }, []);

  // Here we reset values and get members whenever modal opens or closes
  useEffect(() => {
    getAllMembers();
    setTags([]);
    setSearch('');
    setMembersToAdd([]);
  }, [open]);

  /**
   * This function maintains and avoid duplicity of multiple users to be added
   * Users which are to be added are maintained in an array 'membersToAdd'
   * @param index
   */
  const handleChange = (index: number, id: string): void => {
    const ind = tags.findIndex((tag) => tag.email === members[index].user.email);
    const memberIndex = members.findIndex((member) => member.user.id === id);
    if (ind === -1) {
      setTags((prevState) => [
        ...prevState,
        {
          id: members[memberIndex].user.id,
          name: members[memberIndex].user.firstName + ' ' + members[memberIndex].user.lastName,
          email: members[memberIndex].user.email,
          avatarUrl: members[memberIndex].user.avatarUrl,
        },
      ]);
      setMembersToAdd((prevState) => [
        ...prevState,
        {
          userId: members[memberIndex].user.id,
          teamId: currentTeam._id,
          organizationId: currentOrganization._id,
          firstName: members[memberIndex].user.firstName,
          lastName: members[memberIndex].user.lastName,
        },
      ]);
      members[memberIndex].checked = true;
    } else {
      members[index].checked = false;
      setTags(tags.filter((item) => item.email !== tags[ind].email));
      setMembersToAdd(membersToAdd.filter((item) => item.userId !== tags[ind].id));
    }
  };

  /**
   * This function removes the member from array when un-checked
   * @param index
   */
  const removeMember = (index: number): void => {
    const memberIndex = members.findIndex((member) => member.user.email === tags[index].email);
    members[memberIndex].checked = false;
    setTags(tags.filter((item) => item.email !== tags[index].email));
    setMembersToAdd(membersToAdd.filter((item) => item.userId !== tags[index].id));
  };

  // This function handles the close state of modal
  const onClose = (): void => {
    setOpen(!open);
  };

  // This function send request to the server with array of members to be added and current team id
  const addMembers = async (): Promise<void> => {
    const response = await addMemberToTeam(membersToAdd, currentTeam._id);
    response.status === 200
      ? (notify(response.message, 'success'), setOpen(!open))
      : notify(response.message, 'error');
  };

  /**
   * This function just set the value of input field
   * @param e
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  const ModalFooter = (): JSX.Element[] => {
    return [
      <div key="1" className="modal-footer">
        <Button key="1" className="btn-outlined-cancel" type="text" onClick={onClose}>
          Cancel
        </Button>

        <Button
          key="2"
          type="primary"
          onClick={addMembers}
          disabled={members.length === 0 || membersToAdd.length === 0}
        >
          Add Members
        </Button>
      </div>,
    ];
  };

  return (
    <div>
      <Button onClick={onClose} type="primary">
        Add a New Member
      </Button>
      <Modal
        visible={open}
        footer={ModalFooter()}
        onCancel={onClose}
        className="pending-invites-modal modal-common-styling"
      >
        <div className="heading-label-form">
          <div className="d-flex">
            <h4>Team Members</h4>
            <button className="icon-button" onClick={onClose}></button>
          </div>
          <p>Invite members that are already part of your organization</p>
        </div>
        {tags.map((tag, index) => (
          <Tag key={index}>
            <Avatar
              icon={tag.avatarUrl !== '' || null ? <img src={tag.avatarUrl} /> : <UserOutlined />}
              style={{ backgroundColor: 'grey' }}
            />
            {tag.name}
            <img
              src="/tag-close.svg"
              alt="close"
              onClick={() => {
                removeMember(index);
              }}
            />
          </Tag>
        ))}
        <Input
          type="text"
          placeholder="Search a member"
          value={search}
          onChange={handleSearchChange}
          prefix={<img src="/search.svg" />}
          size="large"
        />
        {members.length === 0 && (
          <div className="not-found-data">
            <NoResult
              subText="You have no Member in your Organization Yet"
              text="No Member Found!"
            />
          </div>
        )}
        {members.length > 0 && (
          <List itemLayout="horizontal">
            {members
              .filter(
                (member) => member.user.name.toLowerCase().indexOf(search.toLowerCase()) !== -1,
              )
              .map((item, index) => (
                <List.Item key={index}>
                  {teamStore.members.findIndex((member) => member.userId._id === item.user.id) ===
                  -1 ? (
                    <Checkbox
                      checked={item.checked}
                      onChange={() => handleChange(index, item.user.id)}
                    />
                  ) : (
                    ''
                  )}
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={50}
                        style={{ backgroundColor: 'grey' }}
                        icon={
                          item.user.avatarUrl !== '' || null ? (
                            <img src={item.user.avatarUrl} />
                          ) : (
                            <UserOutlined />
                          )
                        }
                      />
                    }
                    title={item.user.name}
                    description={item.user.email}
                  />
                </List.Item>
              ))}
          </List>
        )}
      </Modal>
    </div>
  );
};

export default inject('store', 'teamStore')(observer(AddMemberModal));
