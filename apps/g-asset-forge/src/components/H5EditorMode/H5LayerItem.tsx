import './H5LayerItem.scss';

import {
  HideOutlined,
  LockFilled,
  ShowOutlined,
  SmallCaretDownSolid,
  UnlockFilled,
} from '@g-asset-forge/icons';
import classNames from 'classnames';
import { type FC, useEffect, useRef, useState } from 'react';

import { SvgIcon } from '../SvgIcon/SvgIcon';

interface H5LayerItemProps {
  id: string;
  type: string;
  name: string;
  children?: H5LayerItemProps[];
  active?: boolean;
  activeSecond?: boolean;
  level?: number;
  activeIds?: string[];
  hlId?: string;
  visible: boolean;
  visibleSecond?: boolean;
  lock: boolean;
  lockSecond?: boolean;
  onSelect: (id: string, event: React.MouseEvent) => void;
  onHover: (id: string) => void;
  onHoverLeave: () => void;
  onNameChange?: (id: string, newName: string) => void;
  onVisibilityToggle?: (id: string, isVisible: boolean) => void;
  onLockToggle?: (id: string, isLocked: boolean) => void;
  onDelete?: (id: string) => void;
  onZoomToFit?: (id: string) => void;
}

export const H5LayerItem: FC<H5LayerItemProps> = ({
  name,
  children,
  active = false,
  activeSecond = false,
  id,
  type,
  activeIds = [],
  level = 0,
  hlId,
  visible,
  visibleSecond = true,
  lock,
  lockSecond = false,
  onSelect,
  onHover,
  onHoverLeave,
  onNameChange,
  onVisibilityToggle,
  onLockToggle,
  onDelete,
  onZoomToFit,
}) => {
  const indentWidth = level * 16;
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [layoutName, setLayoutName] = useState(name);

  useEffect(() => {
    setLayoutName(name);
  }, [name]);

  const handleDbClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      const inputEl = inputRef.current;
      if (inputEl) {
        inputEl.value = name;
        inputEl.select();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.currentTarget.blur();
    }
  };

  const handleBlur = () => {
    const inputVal = inputRef.current?.value;
    if (inputVal && onNameChange) {
      onNameChange(id, inputVal);
      setLayoutName(inputVal);
    }
    setIsEditing(false);
  };

  const isHl = hlId === id;

  const finalVisible = visible && visibleSecond;
  const finalLock = lock || lockSecond;

  return (
    <>
      <div
        className={classNames('sk-layer-item', {
          'sk-active': active,
          'sk-active-second': active ? false : activeSecond,
          'sk-hidden': !finalVisible,
          'sk-layer-highlight': isHl,
          'sk-editing': isEditing,
        })}
        onMouseDown={(e) => {
          onSelect(id, e);
        }}
        onMouseEnter={() => {
          onHover(id);
        }}
        onMouseLeave={() => {
          onHoverLeave();
        }}
      >
        <div style={{ width: indentWidth, minWidth: indentWidth }} />
        <div className="sk-group-collapse-btn">
          {children?.length ? <SmallCaretDownSolid /> : undefined}
        </div>
        <div
          className="sk-layer-icon"
          onDoubleClick={() => {
            onZoomToFit?.(id);
          }}
        >
          {type === 'H5Container' ? (
            <SvgIcon name="icon.24.sticky" size={12} />
          ) : (
            <SvgIcon name="icon.24.plugin" size={12} />
          )}
        </div>
        {!isEditing && (
          <span className="sk-layout-name" onDoubleClick={handleDbClick}>
            {layoutName}
          </span>
        )}
        {isEditing && (
          <input
            ref={inputRef}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            defaultValue={layoutName}
          />
        )}
        <div
          className={`sk-layer-item-actions ${
            finalLock || !finalVisible ? 'sk-action-visible' : ''
          }`}
          onMouseDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <span
            className="sk-action-btn"
            style={{
              visibility: finalLock ? 'visible' : undefined,
            }}
            onMouseDown={() => {
              onLockToggle?.(id, !lock);
            }}
            title={lock ? '解锁' : '锁定'}
          >
            {lock ? <LockFilled /> : <UnlockFilled />}
          </span>
          <span
            className="sk-action-btn"
            style={{
              visibility: !finalVisible ? 'visible' : undefined,
            }}
            onMouseDown={() => {
              onVisibilityToggle?.(id, !visible);
            }}
            title={visible ? '隐藏' : '显示'}
          >
            {!visible ? (
              <HideOutlined />
            ) : !visibleSecond ? (
              <div className="sk-point-solid" />
            ) : (
              <ShowOutlined />
            )}
          </span>
          <span
            className="sk-action-btn"
            onMouseDown={() => {
              onDelete?.(id);
            }}
            title="删除"
          >
            <div className="sk-remove-icon">×</div>
          </span>
        </div>
      </div>
      {children && (
        <div className="layer-item-children">
          {[...children].reverse().map((item) => (
            <H5LayerItem
              key={item.id}
              id={item.id}
              type={item.type}
              name={item.name}
              active={activeIds.includes(item.id)}
              activeSecond={activeSecond || activeIds.includes(item.id)}
              level={level + 1}
              children={item.children}
              activeIds={activeIds}
              hlId={hlId}
              visible={item.visible}
              visibleSecond={finalVisible}
              lock={item.lock}
              lockSecond={finalLock}
              onSelect={onSelect}
              onHover={onHover}
              onHoverLeave={onHoverLeave}
              onNameChange={onNameChange}
              onVisibilityToggle={onVisibilityToggle}
              onLockToggle={onLockToggle}
              onDelete={onDelete}
              onZoomToFit={onZoomToFit}
            />
          ))}
        </div>
      )}
    </>
  );
};
