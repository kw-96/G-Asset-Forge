import './ContextMenuItem.scss';

import classNames from 'classnames';
import { type FC, type PropsWithChildren } from 'react';

interface IProps extends PropsWithChildren {
  suffix?: string;
  disabled?: boolean;
  onClick(): void;
}

const ContextMenuItem: FC<IProps> = ({
  children,
  suffix,
  disabled,
  onClick,
}) => {
  return (
    <div
      className={classNames('g-asset-forge-context-menu-item', {
        'g-asset-forge-is-disable': disabled,
      })}
      onClick={onClick}
    >
      {children}
      {suffix && <span>{suffix}</span>}
    </div>
  );
};

export default ContextMenuItem;
