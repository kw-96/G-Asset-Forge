import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { Button } from '../../ui/components/Button/Button';
import { IconButton } from '../../ui/components/IconButton/IconButton';
import { Dropdown, DropdownItem } from '../../ui/components/Dropdown/Dropdown';
import { Badge } from '../../ui/components/Badge/Badge';
const ToolbarContainer = styled.div `
  height: 48px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
  backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const ToolbarSection = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const ToolbarDivider = styled.div `
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: 0 ${({ theme }) => theme.spacing.sm};
`;
const AppLogo = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-right: ${({ theme }) => theme.spacing.lg};
`;
const LogoIcon = styled.div `
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: 16px;
`;
const AppName = styled.span `
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;
const CenterSection = styled.div `
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;
const ProjectInfo = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const ProjectName = styled.span `
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;
const ZoomControl = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
`;
const ZoomValue = styled.span `
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 40px;
  text-align: center;
`;
export const TopToolbar = ({ onToggleLeftPanel, onToggleRightPanel, leftPanelCollapsed, rightPanelCollapsed, }) => {
    const handleFileAction = (action) => {
        console.log('File action:', action);
    };
    const handleEditAction = (action) => {
        console.log('Edit action:', action);
    };
    const handleZoomChange = (delta) => {
        console.log('Zoom change:', delta);
    };
    return (_jsxs(ToolbarContainer, { children: [_jsxs(ToolbarSection, { children: [_jsxs(AppLogo, { children: [_jsx(LogoIcon, { children: "G" }), _jsx(AppName, { children: "G-Asset Forge" })] }), _jsxs(Dropdown, { trigger: _jsx(Button, { variant: "ghost", size: "sm", children: "\u6587\u4EF6" }), children: [_jsx(DropdownItem, { onSelect: () => handleFileAction('new'), children: "\uD83C\uDD95 \u65B0\u5EFA\u9879\u76EE" }), _jsx(DropdownItem, { onSelect: () => handleFileAction('open'), children: "\uD83D\uDCC1 \u6253\u5F00\u9879\u76EE" }), _jsx(DropdownItem, { onSelect: () => handleFileAction('save'), children: "\uD83D\uDCBE \u4FDD\u5B58\u9879\u76EE" }), _jsx(DropdownItem, { onSelect: () => handleFileAction('export'), children: "\uD83D\uDCE4 \u5BFC\u51FA\u56FE\u50CF" })] }), _jsxs(Dropdown, { trigger: _jsx(Button, { variant: "ghost", size: "sm", children: "\u7F16\u8F91" }), children: [_jsx(DropdownItem, { onSelect: () => handleEditAction('undo'), children: "\u21B6 \u64A4\u9500" }), _jsx(DropdownItem, { onSelect: () => handleEditAction('redo'), children: "\u21B7 \u91CD\u505A" }), _jsx(DropdownItem, { onSelect: () => handleEditAction('copy'), children: "\uD83D\uDCCB \u590D\u5236" }), _jsx(DropdownItem, { onSelect: () => handleEditAction('paste'), children: "\uD83D\uDCC4 \u7C98\u8D34" })] }), _jsx(ToolbarDivider, {}), _jsx(IconButton, { variant: "ghost", size: "sm", icon: leftPanelCollapsed ? '▶️' : '◀️', onClick: onToggleLeftPanel })] }), _jsxs(CenterSection, { children: [_jsxs(ProjectInfo, { children: [_jsx(ProjectName, { children: "\u672A\u547D\u540D\u9879\u76EE" }), _jsx(Badge, { variant: "success", size: "sm", children: "\u5DF2\u4FDD\u5B58" })] }), _jsxs(ZoomControl, { children: [_jsx(IconButton, { variant: "ghost", size: "xs", icon: "\u2796", onClick: () => handleZoomChange(-10) }), _jsx(ZoomValue, { children: "100%" }), _jsx(IconButton, { variant: "ghost", size: "xs", icon: "\u2795", onClick: () => handleZoomChange(10) })] })] }), _jsxs(ToolbarSection, { children: [_jsx(IconButton, { variant: "ghost", size: "sm", icon: "\uD83C\uDFA8", onClick: () => console.log('Switch to design mode') }), _jsx(IconButton, { variant: "ghost", size: "sm", icon: "\uD83D\uDCF1", onClick: () => console.log('Switch to H5 mode') }), _jsx(ToolbarDivider, {}), _jsx(IconButton, { variant: "ghost", size: "sm", icon: rightPanelCollapsed ? '◀️' : '▶️', onClick: onToggleRightPanel }), _jsxs(Dropdown, { trigger: _jsx(IconButton, { variant: "ghost", size: "sm", icon: "\u2699\uFE0F" }), children: [_jsx(DropdownItem, { children: "\uD83C\uDF19 \u5207\u6362\u4E3B\u9898" }), _jsx(DropdownItem, { children: "\uD83D\uDD27 \u504F\u597D\u8BBE\u7F6E" }), _jsx(DropdownItem, { children: "\u2753 \u5E2E\u52A9" }), _jsx(DropdownItem, { children: "\u2139\uFE0F \u5173\u4E8E" })] })] })] }));
};
//# sourceMappingURL=TopToolbar.js.map