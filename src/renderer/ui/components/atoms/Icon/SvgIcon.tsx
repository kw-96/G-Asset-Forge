import React from 'react';

type SvgIconProps = {
  name: string; // e.g. "icon.24.settings" or "icon.16.more"
  size?: number; // px
  className?: string;
  title?: string;
};

// Webpack require context to load svg icons from assets/icons
// This will include any .svg placed under assets/icons/**
// If the icon is missing, a simple fallback will be rendered
// so the app still runs without breaking imports.
let iconMap: Record<string, string> = {};
try {
  // @ts-ignore - require.context is provided by webpack
  // assets/icons 位于项目根目录，从当前文件路径需要上跳四级
  const req = require.context('../../../../../../assets/icons', true, /\.svg$/);
  req.keys().forEach((key: string) => {
    const normalized = key
      .replace(/^\.\//, '')
      .replace(/\.svg$/i, '')
      .replace(/\\/g, '/');
    // derive name from path, e.g. icon.24/settings -> icon.24.settings
    const parts = normalized.split('/');
    const name = parts.join('.');
    const href = req(key);
    const finalHref: string = (href && (href as any).default) ? (href as any).default : (href as string);
    iconMap[name] = finalHref;

    // Provide aliases for files whose filenames also include the size prefix, e.g.:
    //  assets/icons/icon.24/icon.24.design.svg → map to "icon.24.design" as well
    const folder = parts[0];
    const fileBase: string = parts.length > 0 ? String(parts[parts.length - 1] ?? '') : '';
    const isSizeFolder = folder === 'icon.24' || folder === 'icon.16';
    const hasDuplicatedPrefix = /^icon\.(?:24|16)\./.test(fileBase);
    if (isSizeFolder && hasDuplicatedPrefix) {
      const trimmed = fileBase.replace(/^icon\.(?:24|16)\./, '');
      const altName = `${folder}.${trimmed}`;
      iconMap[altName] = finalHref;
    }
  });
} catch {}

export const SvgIcon: React.FC<SvgIconProps> = ({ name, size = 24, className, title }) => {
  const src = iconMap[name];
  if (src) {
    const ariaHidden = title ? undefined : true;
    const props: any = { src, width: size, height: size, alt: title || '', className };
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
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: 4,
        background: '#e5e7eb',
        border: '1px solid #d1d5db'
      }}
    />
  );
};

export type { SvgIconProps };
export { SvgIcon as FigmaSvgIcon };


