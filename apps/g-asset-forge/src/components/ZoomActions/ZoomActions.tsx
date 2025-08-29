import './ZoomActions.scss';

import { isWindows } from '@g-asset-forge/common';
import { type SettingValue } from '@g-asset-forge/core';
import { ArrowDownOutlined } from '@g-asset-forge/icons';
import { useClickAway } from 'ahooks';
import classNames from 'classnames';
import { type FC, useContext, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { EditorContext } from '../../context';
import { type MessageIds } from '../../locale';
import { ActionItem } from './components/ActionItem';
import { ZoomInput } from './components/ZoomInput';

export const ZoomActions: FC = () => {
  const editor = useContext(EditorContext);
  const [zoom, setZoom] = useState(1);
  const [setting, setSetting] = useState<SettingValue>({} as SettingValue);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickAway(() => {
    setPopoverVisible(false);
  }, containerRef);

  useEffect(() => {
    if (editor?.editor) {
      setZoom(editor?.editor?.viewportManager?.getZoom());
      setSetting(editor?.editor?.setting?.getAttrs());

      const handler = (zoom: number) => {
        setZoom(zoom);
      };
      editor?.editor?.viewportManager.on('zoomChange', handler);
      editor?.editor?.setting.on('update', (setting) => {
        setSetting(setting);
      });
      return () => {
        editor?.editor?.viewportManager.off('zoomChange', handler);
      };
    }
  }, [editor]);

  return (
    <div ref={containerRef} className="zoom-actions">
      <div
        className={classNames(['value', { active: popoverVisible }])}
        onClick={() => {
          setPopoverVisible(!popoverVisible);
        }}
      >
        {Math.round(zoom * 100)}%
        <ArrowDownOutlined />
      </div>
      {popoverVisible && (
        <div className="popover">
          <div className="zoom-input-box">
            <ZoomInput
              defaultValue={zoom}
              onChange={(newZoom) => {
                editor?.editor?.viewportManager.setZoom(
                  newZoom,
                  editor?.editor?.viewportManager?.getSceneCenter(),
                );
                editor?.editor?.render();
              }}
            />
            <div
              className="zoom-action-item"
              onClick={() => {
                editor?.editor?.viewportManager?.zoomToFit();
              }}
            />
            <div
              className="zoom-action-item"
              onClick={() => {
                editor?.editor?.viewportManager?.zoomToSelection();
              }}
            />
          </div>
          <div className="separator" />
          {(
            [
              {
                id: 'zoom.zoomIn',
                suffix: isWindows() ? 'Ctrl++' : '⌘+',
                action: () => {
                  editor?.editor?.viewportManager.zoomIn({ isLevelZoom: true });
                },
              },
              {
                id: 'zoom.zoomOut',
                suffix: isWindows() ? 'Ctrl+-' : '⌘-',
                action: () => {
                  editor?.editor?.viewportManager.zoomOut({
                    isLevelZoom: true,
                  });
                },
              },
              {
                id: 'zoom.zoomToFit',
                suffix: isWindows() ? 'Shift+1' : '⇧1',
                action: () => {
                  editor?.editor?.viewportManager?.zoomToFit();
                },
              },
              {
                id: 'zoom.zoomToSelection',
                suffix: isWindows() ? 'Shift+2' : '⇧2',
                action: () => {
                  editor?.editor?.viewportManager?.zoomToSelection();
                },
              },
              {
                id: 'zoom.zoomTo50',
                action: () => {
                  editor?.editor?.viewportManager.setZoomAndUpdateViewport(0.5);
                },
              },
              {
                id: 'zoom.zoomTo100',
                suffix: isWindows() ? 'Ctrl+0' : '⌘0',
                action: () => {
                  editor?.editor?.viewportManager.setZoomAndUpdateViewport(1);
                },
              },
              {
                id: 'zoom.zoomTo200',
                action: () => {
                  editor?.editor?.viewportManager.setZoomAndUpdateViewport(2);
                },
              },
            ] as { id: MessageIds; suffix?: string; action(): void }[]
          ).map((item) => {
            return (
              <ActionItem
                suffix={item.suffix}
                key={item.id}
                onClick={() => {
                  item.action();
                  editor?.editor?.render();
                  setPopoverVisible(false);
                }}
              >
                <FormattedMessage id={item.id} />
              </ActionItem>
            );
          })}
        </div>
      )}
    </div>
  );
};
