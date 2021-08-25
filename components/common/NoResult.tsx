/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { NoResultPropsInterface } from 'interfaces';

const NoResult: FC<NoResultPropsInterface> = (props) => {
  const { text, subText } = props;
  return (
    <>
      <img src="/no-search-result.svg" alt="not-found" />
      <h4>{text}</h4>
      <p>{subText}</p>
    </>
  );
};

export default NoResult;
