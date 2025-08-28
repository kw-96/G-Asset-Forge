import './popover.scss';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset as floatUiOffset,
  type OffsetOptions,
  type Placement,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import React, { type FC, useState } from 'react';

interface PopoverProps {
  content: React.ReactNode;
  children: React.ReactElement;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  placement?: Placement;
  trigger?: 'click' | 'hover';
  offset?: OffsetOptions;
}

export const Popover: FC<PopoverProps> = (props) => {
  const {
    content,
    children,
    placement = 'bottom-start',
    trigger = 'click',
    offset = 5, // 偏移量
  } = props;

  const [open, setOpen] = useState(false);

  const onOpenChange = (visible: boolean) => {
    setOpen(visible);
    props.onOpenChange?.(visible);
  };

  const mixedOpen = props.open === undefined ? open : props.open;

  const { x, y, strategy, refs, context } = useFloating({
    placement: placement, // 定位策略，如 'bottom-end'
    open: mixedOpen, // 是否打开
    onOpenChange, // 打开状态变化回调
    whileElementsMounted: autoUpdate, // 自动更新位置
    middleware: [
      flip({
        fallbackAxisSideDirection: 'end', // 如果主轴方向空间不足，尝试使用次轴方向
      }),
      floatUiOffset(offset), // 偏移量
    ],
  });

  const click = useClick(context, {
    event: 'mousedown',
    enabled: trigger === 'click',
  });
  const dismiss = useDismiss(context);

  const hover = useHover(context, {
    enabled: trigger === 'hover',
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    hover,
    dismiss,
  ]);

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        ...getReferenceProps(),
        ref: refs.setReference,
      })}
      <FloatingPortal>
        {mixedOpen && (
          <div
            ref={refs.setFloating}
            className="sk-popover-content"
            style={{
              position: strategy,
              left: x ?? 0,
              top: y ?? 0,
            }}
            {...getFloatingProps()}
          >
            {content}
          </div>
        )}
      </FloatingPortal>
    </>
  );
};
