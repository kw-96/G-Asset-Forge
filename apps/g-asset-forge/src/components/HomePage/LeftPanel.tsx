/**
 * 首页左侧面板组件
 * 包含项目logo、搜索栏、项目库、模板库、素材库、字体库
 */

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { SvgIcon } from '../SvgIcon';

export interface LeftPanelProps {
  selectedItem: string;
  onItemSelect: (item: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  selectedItem,
  onItemSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    {
      id: 'project-library',
      label: 'homePage.projectLibrary',
    },
    {
      id: 'template-library',
      label: 'homePage.templateLibrary',
    },
    {
      id: 'asset-library',
      label: 'homePage.assetLibrary',
    },
    {
      id: 'font-library',
      label: 'homePage.fontLibrary',
    },
    {
      id: 'settings',
      label: 'homePage.settings',
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: 实现搜索功能
  };

  return (
    <div className="left-panel">
      {/* 项目Logo和名称 */}
      <div className="left-panel__header">
        <div className="project-logo">
          <SvgIcon name="icon.24.GAF" size={24} />
        </div>
        <h1 className="project-name">
          <FormattedMessage id="homePage.title" />
        </h1>
      </div>

      {/* 搜索栏 */}
      <div className="left-panel__search">
        <div className="search-input-wrapper">
          <SvgIcon name="icon.24.search" size={16} className="search-icon" />
          <input
            type="text"
            placeholder="搜索项目、模板、素材..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {/* 菜单项 */}
      <div className="left-panel__menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`menu-item ${
              selectedItem === item.id ? 'menu-item--active' : ''
            }`}
            onClick={() => onItemSelect(item.id)}
          >
            <span className="menu-item__label">
              <FormattedMessage id={item.label as any} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
