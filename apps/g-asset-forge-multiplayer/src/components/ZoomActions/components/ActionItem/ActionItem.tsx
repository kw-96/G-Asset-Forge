import './ActionItem.scss';

import { CheckOutlined } from '@g-asset-forge/icons';
import { type FC, type PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
  suffix?: string;
  onClick: () => void;
  check?: boolean;
}

export const ActionItem: FC<IProps> = ({
  onClick,
  children,
  suffix,
  check,
}) => {
  return (
    <div className="g-asset-forge-action-item-wrap" onClick={onClick}>
      <div className="g-asset-forge-action-item">
        <div className="g-asset-forge-icon-box">{check && <CheckOutlined />}</div>
        {children}
      </div>
      {suffix && <span>{suffix}</span>}
    </div>
  );
};
