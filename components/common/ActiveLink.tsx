import { inject, observer } from 'mobx-react';

import Link from 'next/link';
import React from 'react';
import { Store } from '../../lib/store';

const ActiveLink = ({
  linkText,
  href,
  as,
  hasIcon,
  highlighterSlug,
  store,
  style,
}: {
  store?: Store;
  style?: Record<string, any>;
  linkText: string;
  href: string;
  as: string;
  hasIcon: boolean;
  highlighterSlug: string;
}) => {
  const selectedElement = store.currentUrl.includes(highlighterSlug);

  const styleAnchor = {
    fontWeight: 400,
    fontSize: '14px',
  };

  const styleAnchorSelectedWithIcon = {
    fontWeight: 400,
    fontSize: '14px',
    position: 'relative',
    left: '-14px',
  };

  const trimmingLength = 20;

  return (
    <Link href={href} as={as}>
      <a
        // onClick={handleClick}
        style={{
          ...(hasIcon && selectedElement ? styleAnchorSelectedWithIcon : styleAnchor),
          ...style,
        }}
      >
        {hasIcon && selectedElement ? (
          <i
            className="material-icons"
            color="action"
            style={{
              fontSize: 14,
              verticalAlign: 'text-bottom',
            }}
          >
            arrow_right
          </i>
        ) : null}
        {linkText.length > trimmingLength
          ? `${linkText.substring(0, trimmingLength)}...`
          : linkText}
      </a>
    </Link>
  );
};

export default inject('store')(observer(ActiveLink));
