import React from 'react';
import './SvgIcon.scss';

type SvgIconProps = {
  name: string; // e.g. "icon.24.settings" or "icon.16.more"
  size?: number; // px
  className?: string;
  title?: string;
};

let iconMap: Record<string, string> = {};

// 检测运行环境
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// 初始化图标映射
const initIconMap = () => {
  try {
    if (isElectron) {
      // Electron环境：使用静态路径映射
      console.log('SvgIcon: 检测到Electron环境，使用静态图标映射');

      // 创建常用图标的静态映射
      const commonIcons = [
        'icon.24.stroke-solid',
        'icon.24.collapse',
        'icon.24.expand',
        'icon.24.close',
        'icon.24.select',
        'icon.24.frame',
        'icon.24.rectangle',
        'icon.24.ellipse',
        'icon.24.image',
        'icon.24.pen',
        'icon.24.pencil',
        'icon.24.line',
        'icon.24.polygon',
        'icon.24.star',
        'icon.24.text',
        'icon.24.hand',
      ];

      // 为常用图标创建占位符映射
      commonIcons.forEach((iconName) => {
        iconMap[iconName] = `./assets/icons/${iconName.replace(
          /\./g,
          '/',
        )}.svg`;
      });
    } else {
      // Web环境：使用Vite的import.meta.glob
      // @ts-ignore - import.meta.glob is provided by Vite
      const modules = import.meta.glob('../../../../../assets/icons/**/*.svg', {
        eager: true,
      });

      Object.entries(modules).forEach(([path, module]) => {
        // 从完整路径中提取相对路径
        const relativePath = path.replace(/^.*?assets\/icons\//, '');
        const normalized = relativePath
          .replace(/\.svg$/i, '')
          .replace(/\\/g, '/');

        const parts = normalized.split('/');
        const name = parts.join('.');
        const finalHref: string =
          module && (module as any).default
            ? (module as any).default
            : (module as string);

        iconMap[name] = finalHref;

        // 添加额外的别名映射
        if (parts.length >= 2) {
          const folder = parts[0]; // 例如: icon.24
          const fileName = parts[1]; // 例如: icon.24.stroke-solid

          // 如果文件名包含文件夹前缀，创建简化名称
          if (fileName.startsWith(folder + '.')) {
            const simpleName = fileName.replace(folder + '.', '');
            const altName = `${folder}.${simpleName}`;
            iconMap[altName] = finalHref;
          }
        }
      });
    }
  } catch (error) {
    console.warn('SvgIcon: 图标加载失败:', error);
  }
};

// 初始化图标映射
initIconMap();

export const SvgIcon: React.FC<SvgIconProps> = ({
  name,
  size = 24,
  className,
  title,
}) => {
  const src = iconMap[name];

  if (src) {
    const ariaHidden = title ? undefined : true;
    const props: any = {
      src,
      width: size,
      height: size,
      alt: title || '',
      className,
    };
    if (ariaHidden !== undefined) {
      props['aria-hidden'] = ariaHidden ? 'true' : 'false';
    }
    return <img {...props} />;
  }

  // Fallback: simple square placeholder to avoid runtime error before assets arrive
  return (
    <span
      title={title || name}
      aria-label={title || name}
      className={`svg-icon-placeholder ${className || ''}`}
      style={{ width: size, height: size }}
    />
  );
};

export type { SvgIconProps };
export { SvgIcon as FigmaSvgIcon };
