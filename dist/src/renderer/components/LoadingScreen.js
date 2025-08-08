import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { keyframes } from 'styled-components';
const spin = keyframes `
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const LoadingContainer = styled.div `
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.background} 0%, ${({ theme }) => theme.colors.surface} 100%);
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, ${({ theme }) => theme.colors.primary}10 0%, transparent 50%);
    pointer-events: none;
  }
`;
const LoadingContent = styled.div `
  text-align: center;
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.border.default}40;
  position: relative;
  z-index: 1;
`;
const Title = styled.h1 `
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;
const Description = styled.p `
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;
const Spinner = styled.div `
  width: 48px;
  height: 48px;
  border: 4px solid ${({ theme }) => theme.colors.border.default}40;
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-right: 4px solid ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  &::after {
    content: '';
    position: absolute;
    width: 32px;
    height: 32px;
    border: 2px solid transparent;
    border-top: 2px solid ${({ theme }) => theme.colors.secondary};
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ${spin} 0.8s linear infinite reverse;
  }
`;
export const LoadingScreen = () => {
    return (_jsx(LoadingContainer, { children: _jsxs(LoadingContent, { children: [_jsx(Title, { children: "G-Asset Forge MVP" }), _jsx(Description, { children: "\u5E94\u7528\u6B63\u5728\u521D\u59CB\u5316..." }), _jsx(Spinner, {})] }) }));
};
//# sourceMappingURL=LoadingScreen.js.map