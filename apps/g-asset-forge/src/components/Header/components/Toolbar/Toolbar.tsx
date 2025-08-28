import './Toolbar.scss';

import { isWindows } from '@g-asset-forge/common';
import { Button } from '@g-asset-forge/components';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../../context';
import { type MessageIds } from '../../../../locale';
import { SvgIcon } from '../../../SvgIcon';
import { ToolBtn } from './components/ToolBtn';

export const ToolBar = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();
  const [currTool, setCurrTool] = useState('');
  const [enableTools, setEnableTools] = useState<string[]>([]);
  const [isPathEditorActive, setIsPathEditorActive] = useState(false);

  useEffect(() => {
    if (editor) {
      setCurrTool(editor.toolManager.getActiveToolName() || '');
      setEnableTools(editor.toolManager.getEnableTools());
      setIsPathEditorActive(editor.pathEditor.isActive());

      const onTogglePathEditor = (active: boolean) => {
        setIsPathEditorActive(active);
      };
      const onSwitchTool = (toolName: string) => {
        setCurrTool(toolName);
      };
      const onChangeEnableTools = (tools: string[]) => {
        setEnableTools(tools);
      };

      editor.toolManager.on('switchTool', onSwitchTool);
      editor.toolManager.on('changeEnableTools', onChangeEnableTools);
      editor.pathEditor.on('toggle', onTogglePathEditor);
      return () => {
        editor.toolManager.off('switchTool', onSwitchTool);
        editor.toolManager.off('changeEnableTools', onChangeEnableTools);
        editor.pathEditor.off('toggle', onTogglePathEditor);
      };
    }
  }, [editor]);

  const keyMap: Record<
    string,
    { name: string; hotkey: string; intlId: MessageIds; icon: JSX.Element }
  > = {
    select: {
      name: 'select',
      hotkey: 'V',
      intlId: 'tool.select',
      icon: <SvgIcon name="icon.24.move" size={24} />,
    },
    drawFrame: {
      name: 'drawFrame',
      hotkey: 'F',
      intlId: 'tool.frame',
      icon: <SvgIcon name="icon.24.frame" size={24} />,
    },
    drawRect: {
      name: 'drawRect',
      hotkey: 'R',
      intlId: 'tool.rectangle',
      icon: <SvgIcon name="icon.24.rectangle" size={24} />,
    },
    drawEllipse: {
      name: 'drawEllipse',
      hotkey: 'O',
      intlId: 'tool.ellipse',
      icon: <SvgIcon name="icon.24.ellipse" size={24} />,
    },
    drawImg: {
      name: 'drawImg',
      hotkey: '',
      intlId: 'tool.image',
      icon: <SvgIcon name="icon.24.image" size={24} />,
    },
    pathSelect: {
      name: 'pathSelect',
      hotkey: 'V',
      intlId: 'tool.select',
      icon: <SvgIcon name="icon.24.select" size={24} />,
    },
    pen: {
      name: 'pen',
      hotkey: 'P',
      intlId: 'tool.pen',
      icon: <SvgIcon name="icon.24.pen" size={24} />,
    },
    pencil: {
      name: 'pencil',
      hotkey: `${isWindows() ? 'Shift+' : '⇧'}P`,
      intlId: 'tool.pencil',
      icon: <SvgIcon name="icon.24.pencil" size={24} />,
    },
    drawLine: {
      name: 'drawLine',
      hotkey: 'L',
      intlId: 'tool.line',
      icon: <SvgIcon name="icon.24.line" size={24} />,
    },
    drawRegularPolygon: {
      name: 'drawRegularPolygon',
      hotkey: '',
      intlId: 'tool.polygon',
      icon: <SvgIcon name="icon.24.polygon" size={24} />,
    },
    drawStar: {
      name: 'drawStar',
      hotkey: '',
      intlId: 'tool.star',
      icon: <SvgIcon name="icon.24.star" size={24} />,
    },
    drawText: {
      name: 'drawText',
      hotkey: 'T',
      intlId: 'tool.text',
      icon: <SvgIcon name="icon.24.text" size={24} />,
    },
    dragCanvas: {
      name: 'dragCanvas',
      hotkey: 'H',
      intlId: 'tool.hand',
      icon: <SvgIcon name="icon.24.hand" size={24} />,
    },
  };

  return (
    <div className="g-asset-forge-tool-bar">
      {enableTools.map((toolType) => {
        const tool = keyMap[toolType];
        return (
          <ToolBtn
            key={tool.name}
            className={classNames({ active: currTool === tool.name })}
            tooltipContent={intl.formatMessage({ id: tool.intlId })}
            hotkey={tool.hotkey}
            onMouseDown={() => {
              editor?.toolManager.setActiveTool(tool.name);
            }}
          >
            {tool.icon}
          </ToolBtn>
        );
      })}

      {isPathEditorActive && (
        <Button
          style={{
            marginLeft: '16px',
            userSelect: 'none',
          }}
          onClick={() => {
            if (editor) {
              editor.pathEditor.inactive();
            }
          }}
        >
          {intl.formatMessage({ id: 'done' })}
        </Button>
      )}
    </div>
  );
};
