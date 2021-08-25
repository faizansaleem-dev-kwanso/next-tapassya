export const getStackStatusFromActionList = (actions) => {
  let status = '-';
  let unprovisionedAction = null;
  if (actions.length > 0) {
    const recentAction = actions
      .slice()
      .reverse()
      .find((action) => action.provisioned && ['deploy', 'stop'].includes(action.action));
    if (recentAction) {
      if (recentAction.action === 'deploy') {
        status = 'up';
      } else if (recentAction.action === 'stop') {
        status = 'down';
      }
    }
    const lastAction = actions[actions.length - 1];
    if (!lastAction.provisioned && !lastAction.cancelled) {
      unprovisionedAction = lastAction.action;
    }
  }
  return [status, unprovisionedAction];
};

export const getStatusAndComment = (actions) => {
  const [status, unProvisionedAction] = getStackStatusFromActionList(actions);
  let className = 'warning-badge';
  let classNameDot = 'warning-dot';
  let text = 'Pending';
  let comment = '';
  if (status === 'up') {
    className = 'success-badge';
    classNameDot = 'success-dot';
    text = 'Running';
    if (unProvisionedAction === 'deploy') {
      comment = '(Redeploy in progress)';
    } else if (unProvisionedAction === 'stop') {
      className = 'warning-badge';
      classNameDot = 'warning-dot';
      comment = 'De-provisioning';
      text = 'De-Provisioning';
    }
  } else if (status === 'down') {
    className = 'error-badge';
    classNameDot = 'error-dot';
    text = 'Stopped';
  }
  if (unProvisionedAction === 'deploy' && (status === '-' || status === 'down')) {
    comment = '(Deploy in progress)';
  }
  return {
    className,
    classNameDot,
    text,
    comment,
    status,
    unProvisionedAction,
  };
};

export default {
  getStackStatusFromActionList,
  getStatusAndComment,
};
