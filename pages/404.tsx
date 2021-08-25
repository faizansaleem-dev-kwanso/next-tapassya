/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import '../styles/404.module.less';
import { useRouter } from 'next/router';
import { Button } from 'antd';

const Custom404: React.FC = (): JSX.Element => {
  const router = useRouter();
  const [customError, setCustomError] = useState<string>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>();
  const error = router.query.error;
  useEffect(() => {
    if (router.query.error) {
      setCustomError(router.query.error.toString());
    }
    if (router.query.redirectUrl) {
      setRedirectUrl(router.query.redirectUrl.toString());
    }
  }, []);

  return (
    <div>
      <div className="logo-grid">
        <img src="/logo.svg" alt="logo" className="logo" />
      </div>

      <div className="page-404">
        <img src="/error-404.svg" alt="error" className="banner_img" />
        <h1>404</h1>
        <p>
          {error || customError ? (
            <>{customError ? customError : error}</>
          ) : (
            <>
              Sorry. the content you’re looking for doesn’t exist. Either it
              <br /> was removed, or you mistyped the link.
            </>
          )}
        </p>
        {redirectUrl && (
          <Button className="btn-primary" type="primary" onClick={() => router.push(redirectUrl)}>
            Go To Homepage
          </Button>
        )}
      </div>
    </div>
  );
};

export default Custom404;
