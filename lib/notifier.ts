import { notification } from 'antd';

export default function notify(obj, type: string, isOnboarding?: boolean) {
  notification[type]({
    message: obj.message || obj.toString(),
    duration: 1,
    className:
      type === 'success' || type === 'error' || type === 'info'
        ? isOnboarding
          ? `ant-notification-notice-onboarding-${type}`
          : `ant-notification-notice-${type}`
        : isOnboarding
        ? 'ant-notification-notice-onboarding-error'
        : 'ant-notification-notice-error',
  });
}
