import React from 'react';

import { SvgIcon } from '../../SvgIcon/SvgIcon';

interface LayerIconProps {
  content: string | React.ComponentType;
  enableStroke?: boolean;
  enableFill?: boolean;
}

export const LayerIcon = React.memo(
  ({ content, enableStroke = true, enableFill }: LayerIconProps) => {
    // 如果content是React组件，直接渲染
    if (typeof content === 'function' || React.isValidElement(content)) {
      const IconComponent = content as React.ComponentType;
      return (
        <div
          style={{
            width: '12px',
            height: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComponent />
        </div>
      );
    }

    // 如果content是图标名称，使用SvgIcon组件
    if (content === 'icon.24.sticky') {
      return <SvgIcon name="icon.24.sticky" size={12} />;
    }

    // 如果content是字符串路径，使用原来的SVG渲染方式
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="12"
        height="12"
      >
        <path
          d={content as string}
          fill={enableFill ? 'currentColor' : 'none'}
          strokeWidth="1"
          stroke={enableStroke ? 'currentColor' : 'none'}
        />
      </svg>
    );
  },
);
