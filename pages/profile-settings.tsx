import * as React from 'react';

import { Avatar, Button, Input, Select, Breadcrumb, Typography, Modal } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import Router, { withRouter } from 'next/router';
import { getSignedRequestForUpload, uploadFileUsingSignedPutRequest } from '../lib/api/team-member';
import { inject, observer } from 'mobx-react';
import ReactCrop, { Crop } from 'react-image-crop';
import Link from 'next/link';
import { BUCKET_FOR_TEAM_AVATARS, URL_API, COMMON_ENTITY } from '../lib/consts';
import Head from 'next/head';
import Layout from '../components/layout';
import NProgress from 'nprogress';
import notify from '../lib/notifier';
import { withAuth } from '../lib/auth';
import StacksModal from '../components/common/StacksModal';
import { ProfileSettingsProps, ProfileSettingsState } from 'interfaces';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/Profile.module.less';
import { deactivateAccount } from 'lib/api/team-leader';
import OrganizationNotification from 'components/common/OrganizationNotification';
import Pluralize from 'pluralize';
import router from 'next/router';

const { Option } = Select;
const { Title } = Typography;

const imageDefaults = {
  src: null,
  croppedImageUrl: null,
  srcName: null,
  srcType: null,
  fileUrl: null,
  crop: {
    unit: 'px',
    width: 200,
    height: 200,
    aspect: 1 / 1,
  },
};

class ProfileSettings extends React.Component<ProfileSettingsProps, ProfileSettingsState> {
  reader: any;
  imageRef: any;
  fileUrl: any;
  profilePicture: any;

  showModalDeactivate = () => {
    this.setState({ isShowModal: true });
  };
  closeModal = () => {
    this.setState({ isShowModal: false });
  };

  constructor(props: ProfileSettingsProps) {
    super(props);
    if (typeof window !== 'undefined') {
      this.reader = new window.FileReader();
    }
    this.state = {
      newFirstName: '',
      newLastName: '',
      newAvatarUrl: '',
      defaultTeamSlug: '',
      isModalVisible: false,
      isShowModal: false,
      isEdit: false,
      disabled: false,
      ...imageDefaults,
    };
    if (this.props.store.currentUser) {
      this.state = {
        ...this.state,
        newFirstName: this.props.store.currentUser.firstName,
        newLastName: this.props.store.currentUser.lastName,
        newAvatarUrl: this.props.store.currentUser.avatarUrl,
        defaultTeamSlug: this.props.store.currentUser.defaultTeamSlug,
      };
    }
  }

  public componentDidMount() {
    const { error } = this.props;

    if (error) {
      notify(error, 'error');
    }

    const router = this.props.router;
    const { query } = router;
    const { checkout_canceled } = query;
    const stripeError = query.error;
    if (!!checkout_canceled) {
      notify('Checkout canceled', 'info');
    }

    if (stripeError) {
      notify(stripeError, 'error');
    }

    if (!!checkout_canceled || stripeError) {
      Router.replace({
        pathname: router.pathname,
        query: {},
      });
    }
  }

  showModal = () => {
    this.setState({ isModalVisible: true });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false, ...imageDefaults });
  };

  onSelectFile = (e: { target: HTMLInputElement }) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0] as File;

      if (file == null) {
        notify('No file selected for upload.', 'info');
        return;
      }

      if (/\.(jpe?g|png|gif)$/i.test(file.name) === false) {
        notify('Accepted file formats are jpg, jpeg, png & gif', 'info');
        return;
      }

      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 4) {
        notify('Max file size is 4 MB', 'info');
        return;
      }

      this.reader.onload = (e: Event & { target: { result: string } }) => {
        const img = new Image();
        img.onload = async () => {
          if (img.naturalHeight < 160 || img.naturalWidth < 160) {
            notify('Profile image needs to be atleast 160 x 160 px', 'info');
            return;
          }

          this.setState({
            src: this.reader.result,
            srcName: file.name,
            srcType: file.type,
            isModalVisible: true,
          });
        };
        img.onerror = () => {
          notify('Invalid image content', 'info');
          return false;
        };
        img.src = e.target.result as any;
      };
      this.reader.readAsDataURL(file);
    }
  };

  onImageLoaded = (image: HTMLImageElement) => {
    this.imageRef = image;
  };

  onCropComplete = (crop: Crop) => {
    this.makeClientCrop(crop);
  };

  onCropChange = (crop: Crop) => {
    this.setState({ crop });
  };

  async makeClientCrop(crop: Crop) {
    if (this.imageRef && crop.width && crop.height) {
      const croppedImageUrl = await this.getCroppedImg(this.imageRef, crop);
      this.setState({ croppedImageUrl });
    }
  }

  getCroppedCanvas = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    return canvas;
  };

  async getCroppedBlob(image: HTMLImageElement, crop: Crop) {
    const canvas = this.getCroppedCanvas(image, crop);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject('Canvas is empty');
          return;
        }
        resolve(blob);
      }, this.state.srcType);
    });
  }

  getCroppedImg(image: HTMLImageElement, crop: Crop) {
    const canvas = this.getCroppedCanvas(image, crop);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        window.URL.revokeObjectURL(this.fileUrl);
        this.fileUrl = window.URL.createObjectURL(blob);
        resolve(this.fileUrl);
      }, this.state.srcType);
    });
  }

  handleDeactivateAccount = async () => {
    const { router } = this.props;
    const response = await deactivateAccount();
    if (response.status === 200) {
      router.push(`${URL_API}/api/v1/auth0/logout`);
    }
  };

  public renderTeam() {
    const { teams } = this.props.store;

    if (teams.length < 2) {
      return null;
    }

    return (
      <>
        <form onSubmit={this.onSubmitTeam} autoComplete="off">
          <h4>Default team</h4>
          <Select
            value={this.state.defaultTeamSlug}
            onChange={(defaultTeamSlug) => {
              this.setState({ defaultTeamSlug });
            }}
          >
            {teams.map((team) => (
              <Option key={team._id} value={team.slug}>
                {team.name}
              </Option>
            ))}
          </Select>
          <br />
          <br />
          <Button type="primary" htmlType="submit" disabled={this.state.disabled}>
            Update default team
          </Button>
        </form>
        <br />
      </>
    );
  }

  public render() {
    const { currentUser, currentOrganization } = this.props.store;
    const { newFirstName, newLastName, newAvatarUrl } = this.state;
    const { crop, croppedImageUrl, src } = this.state;

    if (!currentUser) {
      return null;
    }

    return (
      <Layout {...this.props}>
        <Head>
          <title>Profile Settings</title>
          <meta name="description" content="description" />
        </Head>
        {currentOrganization.isTransferred && <OrganizationNotification />}
        <Breadcrumb className="breadcrumb">
          <Link href={`/${currentOrganization.slug}/${Pluralize(COMMON_ENTITY)}`}>
            <a>
              <span className="breadcrumb__inner">
                <img src="/home.svg" alt="home" />
              </span>
            </a>
          </Link>
          <Link href="profile-settings">
            <a>
              <span className="breadcrumb__inner">Profile Settings</span>
            </a>
          </Link>
        </Breadcrumb>

        <div className="profile-info">
          <a onClick={() => router.back()}>
            <img src="/chevron-left.svg" alt="back" /> Back
          </a>
        </div>

        <div className="profile-form">
          <div className="d-flex">
            <div className="d-flex d-flex-avatar">
              <div className="avatar-wrapper">
                <Avatar
                  icon={
                    croppedImageUrl || newAvatarUrl ? (
                      <img src={croppedImageUrl || newAvatarUrl} />
                    ) : (
                      <UserOutlined />
                    )
                  }
                  style={{ backgroundColor: 'grey' }}
                  size={128}
                />
                <label htmlFor="upload-file">
                  <Button onClick={() => this.profilePicture.click()} type="primary">
                    Upload <EditOutlined />
                  </Button>
                </label>
              </div>

              <div className="user-personal-info">
                <h4>
                  {currentUser.firstName} {currentUser.lastName}
                </h4>
                <p>{currentUser.email}</p>
              </div>
            </div>

            <div>
              {!this.state.isEdit ? (
                <Button
                  onClick={() => this.setState({ isEdit: !this.state.isEdit })}
                  type="primary"
                  className="btn-outlined-icon"
                >
                  <img src="/edit.svg" alt="edit" /> Edit
                </Button>
              ) : (
                <Button
                  onClick={() => this.onSubmitName()}
                  type="primary"
                  className="profile-button"
                  htmlType="submit"
                  disabled={this.state.disabled}
                >
                  Update
                </Button>
              )}
            </div>

            <input
              accept="image/*"
              name="upload-file"
              id="upload-file"
              type="file"
              ref={(ref) => (this.profilePicture = ref)}
              style={{ display: 'none' }}
              onChange={this.onSelectFile}
              onClick={(event) => ((event.target as HTMLInputElement).value = null)}
            />
          </div>

          <div>
            <Modal
              className="modal-upload-avatar"
              title="Upload Avatar"
              confirmLoading={this.state.disabled}
              visible={this.state.isModalVisible}
              onOk={this.uploadFile}
              onCancel={this.handleCancel}
            >
              <div className="react-crop">
                {src && (
                  <ReactCrop
                    src={src}
                    crop={crop}
                    minWidth={160}
                    ruleOfThirds
                    onImageLoaded={this.onImageLoaded}
                    onComplete={this.onCropComplete}
                    onChange={this.onCropChange}
                  />
                )}
              </div>
            </Modal>
          </div>

          <div className="account-details">
            <Title level={5}>Account Details</Title>
            <form autoComplete="off">
              <div className="d-flex form-control">
                <label>First Name</label>

                <div className="right-grid">
                  {this.state.isEdit ? (
                    <Input
                      name="firstName"
                      value={newFirstName}
                      placeholder="Your first name"
                      onChange={(event) => {
                        this.setState({ newFirstName: event.target.value });
                      }}
                      required
                      maxLength={30}
                    />
                  ) : (
                    <label>{currentUser.firstName}</label>
                  )}
                </div>
              </div>

              <div className="d-flex form-control">
                <label>Last Name</label>

                <div className="right-grid">
                  {this.state.isEdit ? (
                    <Input
                      name="lastName"
                      value={newLastName}
                      placeholder="Your last name"
                      onChange={(event) => {
                        this.setState({ newLastName: event.target.value });
                      }}
                      required
                      maxLength={30}
                    />
                  ) : (
                    <label>{currentUser.lastName}</label>
                  )}
                </div>
              </div>

              <div className="d-flex form-control">
                <label>Delete Account</label>

                <div className="right-grid">
                  <Button
                    type="primary"
                    className="btn-danger"
                    onClick={() => this.showModalDeactivate()}
                  >
                    Deactivate Account
                  </Button>

                  <StacksModal
                    isShowModal={this.state.isShowModal}
                    close={this.closeModal}
                    action={this.handleDeactivateAccount}
                    title="Are you Sure you want to Deactivate your Account?"
                    subTitle="All of your data will be permanently removed from our servers forever. This action cannot be undone."
                    buttonText="Deactivate"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  private onSubmitName = async () => {
    const { currentUser } = this.props.store;

    const { newFirstName, newLastName, newAvatarUrl } = this.state;

    if (!newFirstName) {
      notify('First name is required', 'info');
      return;
    }

    if (!newLastName) {
      notify('Last name is required', 'info');
      return;
    }

    NProgress.start();

    try {
      this.setState({ disabled: true });

      await currentUser.updateProfile({
        firstName: newFirstName,
        lastName: newLastName,
        avatarUrl: newAvatarUrl,
      });
      NProgress.done();
      notify('You successfully updated your profile.', 'success');
      this.handleCancel();
    } catch (error) {
      NProgress.done();
      notify(error, 'error');
    } finally {
      this.setState({ disabled: false, isEdit: false });
    }
  };

  private onSubmitTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { defaultTeamSlug } = this.state;

    if (!defaultTeamSlug) {
      notify('Team is required', 'info');
      return;
    }

    NProgress.start();
  };

  private uploadFile = async () => {
    const { store } = this.props;
    const { currentUser } = store;
    const { croppedImageUrl } = this.state;

    if (croppedImageUrl == null) {
      notify('No file selected for upload.', 'info');
      return;
    }

    NProgress.start();

    const bucket = BUCKET_FOR_TEAM_AVATARS;

    const prefix = `${currentUser._id}`;

    try {
      this.setState({ disabled: true });

      const responseFromApiServerForUpload = await getSignedRequestForUpload({
        file: {
          name: this.state.srcName,
          type: this.state.srcType,
        },
        prefix,
        bucket,
        acl: 'public-read',
      });

      const file = await this.getCroppedBlob(this.imageRef, this.state.crop);
      await uploadFileUsingSignedPutRequest(file, responseFromApiServerForUpload.signedRequest, {
        'Cache-Control': 'max-age=2592000',
      });

      this.setState({
        newAvatarUrl: responseFromApiServerForUpload.url,
        isModalVisible: false,
      });

      await currentUser.updateProfile({
        firstName: this.state.newFirstName,
        lastName: this.state.newLastName,
        avatarUrl: this.state.newAvatarUrl,
      });

      notify('You successfully uploaded new photo.', 'success');
      this.handleCancel();
    } catch (error) {
      notify(error, 'error');
    } finally {
      this.setState({ disabled: false });
      NProgress.done();
    }
  };
}

export const getServerSideProps = withAuth(null, { dontRedirect: true });

export default withRouter<ProfileSettingsProps>(inject('store')(observer(ProfileSettings)));
