import './style.scss';

import { GithubOutlined } from '@g-asset-forge/icons';
import { type FC } from 'react';

interface IProps {
  value: string;
}

const Title: FC<IProps> = ({ value }) => {
  return (
    <div className="g-asset-forge-header-title">
      <GithubOutlined />
      <a href="https://github.com/F-star/g-asset-forge" target="_blank">
        {value}
      </a>
    </div>
  );
};

export default Title;
