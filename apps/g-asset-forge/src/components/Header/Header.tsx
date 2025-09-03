import './Header.scss';

import { type FC } from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';
import { WindowControls } from '../WindowControls';
import { Menu } from './components/Toolbar/menu';

interface IProps {
  title: string;
  onBackToHome?: () => void;
  showHomeButton?: boolean;
  children?: React.ReactNode;
}

export const Header: FC<IProps> = ({
  onBackToHome,
  showHomeButton = false,
  children,
}) => {
  return (
    <div
      className="sk-header"
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Header: 阻止双击事件冒泡');
      }}
    >
      {/* 左侧区域 - 主页按钮 */}
      <div className="sk-left-area">
        {showHomeButton && onBackToHome && (
          <button
            type="button"
            className="home-btn"
            onClick={onBackToHome}
            title="首页"
          >
            <SvgIcon name="icon.24.home" size={24} />
          </button>
        )}
      </div>

      <div className="sk-right-area">
        {children}
        <Menu />
        <WindowControls />
      </div>
    </div>
  );
};
