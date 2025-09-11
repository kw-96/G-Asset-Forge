import './Toolbar.scss';

import { Button } from '@g-asset-forge/components';
import { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { EditorContext } from '../../../../context';
import { ToolCategoryBtn } from './components/ToolCategoryBtn';
import { TOOL_CATEGORIES } from './config/toolCategories';

export const ToolBar = () => {
  const editor = useContext(EditorContext);
  const intl = useIntl();
  const [currTool, setCurrTool] = useState('');
  const [enableTools, setEnableTools] = useState<string[]>([]);
  const [isPathEditorActive, setIsPathEditorActive] = useState(false);

  useEffect(() => {
    if (editor?.editor) {
      setCurrTool(editor?.editor?.toolManager?.getActiveToolName() || '');
      setEnableTools(editor?.editor?.toolManager?.getEnableTools());
      setIsPathEditorActive(editor?.editor?.pathEditor?.isActive());

      const onTogglePathEditor = (active: boolean) => {
        setIsPathEditorActive(active);
      };
      const onSwitchTool = (toolName: string) => {
        setCurrTool(toolName);
      };
      const onChangeEnableTools = (tools: string[]) => {
        setEnableTools(tools);
      };

      editor?.editor?.toolManager.on('switchTool', onSwitchTool);
      editor?.editor?.toolManager.on('changeEnableTools', onChangeEnableTools);
      editor?.editor?.pathEditor.on('toggle', onTogglePathEditor);
      return () => {
        editor?.editor?.toolManager.off('switchTool', onSwitchTool);
        editor?.editor?.toolManager.off(
          'changeEnableTools',
          onChangeEnableTools,
        );
        editor?.editor?.pathEditor.off('toggle', onTogglePathEditor);
      };
    }
  }, [editor]);

  const handleToolSelect = (toolId: string) => {
    if (editor?.editor) {
      editor.editor.toolManager.setActiveTool(toolId);
    }
  };

  return (
    <div className="g-asset-forge-tool-bar">
      {TOOL_CATEGORIES.map((category, index) => {
        let position: 'first' | 'middle' | 'last' = 'middle';
        if (index === 0) position = 'first';
        else if (index === TOOL_CATEGORIES.length - 1) position = 'last';

        return (
          <ToolCategoryBtn
            key={category.id}
            category={category}
            currentTool={currTool}
            enableTools={enableTools}
            onToolSelect={handleToolSelect}
            position={position}
          />
        );
      })}

      {isPathEditorActive && (
        <Button
          style={{
            marginLeft: '16px',
            userSelect: 'none',
          }}
          onClick={() => {
            if (editor?.editor) {
              editor?.editor?.pathEditor?.inactive();
            }
          }}
        >
          {intl.formatMessage({ id: 'done' })}
        </Button>
      )}
    </div>
  );
};
