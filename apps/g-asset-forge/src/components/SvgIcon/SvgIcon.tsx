import React from 'react';
import './SvgIcon.scss';

type SvgIconProps = {
  name: string; // e.g. "icon.24.settings" or "icon.16.more"
  size?: number; // px
  className?: string;
  title?: string;
};

let iconMap: Record<string, string> = {};

// 初始化图标映射 - 统一使用动态加载
const initIconMap = () => {
  try {
    // 使用Vite的import.meta.glob动态加载所有图标
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

    console.log(`SvgIcon: 已动态加载 ${Object.keys(iconMap).length} 个图标`);
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
      data-size={size}
    />
  );
};

export type { SvgIconProps };
export { SvgIcon as FigmaSvgIcon };
