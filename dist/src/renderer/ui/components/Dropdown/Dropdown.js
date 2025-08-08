import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import styled, { keyframes } from 'styled-components';
const slideUpAndFade = keyframes `
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const slideRightAndFade = keyframes `
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const slideDownAndFade = keyframes `
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const slideLeftAndFade = keyframes `
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;
const DropdownContent = styled(DropdownMenu.Content) `
  min-width: 160px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
  
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  
  &[data-state='open'][data-side='top'] {
    animation-name: ${slideDownAndFade};
  }
  &[data-state='open'][data-side='right'] {
    animation-name: ${slideLeftAndFade};
  }
  &[data-state='open'][data-side='bottom'] {
    animation-name: ${slideUpAndFade};
  }
  &[data-state='open'][data-side='left'] {
    animation-name: ${slideRightAndFade};
  }
`;
const DropdownItemStyled = styled(DropdownMenu.Item) `
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  color: ${({ theme, $destructive }) => $destructive ? theme.colors.error : theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  user-select: none;
  outline: none;
  
  &:hover,
  &[data-highlighted] {
    background: ${({ theme, $destructive }) => $destructive ? `${theme.colors.error}10` : theme.colors.surface};
  }
  
  &[data-disabled] {
    color: ${({ theme }) => theme.colors.text.disabled};
    cursor: not-allowed;
    
    &:hover {
      background: transparent;
    }
  }
`;
const DropdownSeparator = styled(DropdownMenu.Separator) `
  height: 1px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: ${({ theme }) => theme.spacing.xs} 0;
`;
export const Dropdown = ({ trigger, children, align = 'start', side = 'bottom', }) => {
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: trigger }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownContent, { align: align, side: side, sideOffset: 4, children: children }) })] }));
};
export const DropdownItem = ({ children, onSelect, disabled = false, destructive = false, }) => {
    return (_jsx(DropdownItemStyled, { onSelect: onSelect || (() => { }), disabled: disabled, "$destructive": destructive, children: children }));
};
export const DropdownSeparatorComponent = DropdownSeparator;
//# sourceMappingURL=Dropdown.js.map