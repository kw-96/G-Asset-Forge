import './Header.scss';

import { type FC } from 'react';
// import { LocaleSelector } from '../LocaleSelector'; // 暂时不使用国际化组件
// import { ZoomActions } from '../ZoomActions'; // 暂时不使用缩放组件
import Title from './components/Title';
import { WindowControls } from '../WindowControls';

interface IProps {
  title: string;
}

export const Header: FC<IProps> = ({ title }) => {
  return (
    <div className="sk-header">
      <Title value={title} />
      <div className="sk-right-area">
        <WindowControls />
      </div>
    </div>
  );
};
